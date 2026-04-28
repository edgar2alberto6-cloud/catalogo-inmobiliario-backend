import os
import re
import unicodedata
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db.models import Q

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Property, PropertyImage, Setting
from .serializers import (
    PropertySerializer,
    PropertyImageUploadSerializer,
    SettingSerializer
)

# 🔐 permisos personalizados
from .permissions import IsAdmin, IsAdminOrSeller
from .utils.file_cleanup import delete_field_file_with_retry, delete_many_field_files


# ==========================================================
# 🔎 HELPERS PARA BÚSQUEDA FLEXIBLE
# ==========================================================

EMPTY_FILTER_VALUES = {
    "",
    "all",
    "todos",
    "todo",
    "todas",
    "cualquiera",
    "any",
}


PROPERTY_TYPE_ALIASES = {
    # Casas
    "casa": "house",
    "casas": "house",
    "house": "house",
    "houses": "house",

    # Terrenos
    "terreno": "land",
    "terrenos": "land",
    "land": "land",
    "lands": "land",

    # Departamentos
    "departamento": "apartment",
    "departamentos": "apartment",
    "depa": "apartment",
    "depas": "apartment",
    "apartamento": "apartment",
    "apartamentos": "apartment",
    "apartment": "apartment",
    "apartments": "apartment",

    # Lotes
    "lote": "lots",
    "lotes": "lots",
    "lot": "lots",
    "lots": "lots",

    # Hectáreas
    "hectarea": "hectares",
    "hectareas": "hectares",
    "hectare": "hectares",
    "hectares": "hectares",

    # Rancho
    "rancho": "ranch",
    "ranchos": "ranch",
    "ranch": "ranch",
    "ranches": "ranch",
}


LISTING_TYPE_ALIASES = {
    # Venta
    "venta": "sale",
    "vender": "sale",
    "vendo": "sale",
    "comprar": "sale",
    "compra": "sale",
    "sale": "sale",

    # Renta
    "renta": "rent",
    "rentas": "rent",
    "rent": "rent",
    "rentar": "rent",
    "alquiler": "rent",
    "alquilar": "rent",
}


STATUS_ALIASES = {
    # Disponible
    "disponible": "available",
    "disponibles": "available",
    "available": "available",

    # Pendiente / apartado
    "pendiente": "pending",
    "pendientes": "pending",
    "pending": "pending",
    "apartado": "pending",
    "apartados": "pending",
    "reservado": "pending",
    "reservados": "pending",

    # Vendido
    "vendido": "sold",
    "vendidos": "sold",
    "vendida": "sold",
    "vendidas": "sold",
    "sold": "sold",
}


CREDIT_TYPE_ALIASES = {
    # Sin crédito
    "ninguno": "none",
    "ninguna": "none",
    "no": "none",
    "sin credito": "none",
    "sin creditos": "none",
    "sin financiamiento": "none",
    "none": "none",

    # INFONAVIT
    "infonavit": "infonavit",

    # FOVISSSTE
    "fovissste": "fovissste",

    # Ambos
    "ambos": "both",
    "ambas": "both",
    "both": "both",
    "infonavit fovissste": "both",
    "infonavit y fovissste": "both",
    "fovissste infonavit": "both",
    "fovissste e infonavit": "both",
}


TEXT_SEARCH_FIELDS = [
    "title",
    "description",
    "city",
    "location",
    "measures",
    "specifications",
    "custom_financing_details",
]


def normalize_text(value):
    """
    Convierte textos como:
    'Hectáreas', 'hectarea', ' HECTÁREA '
    en:
    'hectareas', 'hectarea', etc.
    """
    if value is None:
        return ""

    value = str(value).strip().lower()

    # Quitar acentos
    value = unicodedata.normalize("NFD", value)
    value = "".join(
        char for char in value
        if unicodedata.category(char) != "Mn"
    )

    # Quitar símbolos raros y dejar espacios limpios
    value = re.sub(r"[^a-z0-9]+", " ", value)
    value = re.sub(r"\s+", " ", value).strip()

    return value


def get_existing_model_fields(model):
    return {
        field.name
        for field in model._meta.get_fields()
        if hasattr(field, "attname")
    }


def field_exists(model, field_name):
    return field_name in get_existing_model_fields(model)


def get_existing_text_search_fields():
    existing_fields = get_existing_model_fields(Property)
    return [
        field_name
        for field_name in TEXT_SEARCH_FIELDS
        if field_name in existing_fields
    ]


def get_field_choice_values(model, field_name):
    try:
        choices = model._meta.get_field(field_name).choices
    except Exception:
        return set()

    return {
        str(choice[0])
        for choice in choices
        if choice and choice[0] not in [None, ""]
    }


def normalize_choice_value(value, aliases, valid_values):
    """
    Sirve para que query params como:
    ?property_type=hectarea
    ?property_type=hectáreas
    ?property_type=lotes

    se conviertan al valor real de la BD:
    hectares, lots, ranch, etc.
    """
    if value is None:
        return None

    raw_value = str(value).strip()

    if not raw_value:
        return None

    normalized = normalize_text(raw_value)

    if normalized in EMPTY_FILTER_VALUES:
        return None

    # Si ya viene exactamente como la BD lo espera
    if raw_value in valid_values:
        return raw_value

    # Si viene en español, plural, sin acento, etc.
    mapped_value = aliases.get(normalized)

    if mapped_value and mapped_value in valid_values:
        return mapped_value

    # Intento extra: quitar plural simple
    if normalized.endswith("s"):
        singular_value = normalized[:-1]
        mapped_value = aliases.get(singular_value)

        if mapped_value and mapped_value in valid_values:
            return mapped_value

    return None


def resolve_search_alias_values(search, aliases, valid_values):
    """
    Revisa el texto escrito en el buscador y detecta palabras tipo:
    'hectarea', 'hectáreas', 'lotes', 'rancho', 'venta', etc.
    """
    normalized_search = normalize_text(search)

    if not normalized_search:
        return set()

    candidates = {normalized_search}

    # También revisamos palabra por palabra
    for token in normalized_search.split():
        candidates.add(token)

        # Intento simple para plural
        if token.endswith("s"):
            candidates.add(token[:-1])

    resolved_values = set()

    for candidate in candidates:
        mapped_value = aliases.get(candidate)

        if mapped_value and mapped_value in valid_values:
            resolved_values.add(mapped_value)

    return resolved_values


def safe_decimal(value):
    if value is None or str(value).strip() == "":
        return None

    cleaned_value = str(value).replace(",", "").strip()

    try:
        return Decimal(cleaned_value)
    except (InvalidOperation, ValueError):
        return None


def apply_decimal_filter(queryset, field_name, lookup, value):
    decimal_value = safe_decimal(value)

    if decimal_value is None:
        return queryset

    return queryset.filter(**{f"{field_name}__{lookup}": decimal_value})


def apply_accent_insensitive_contains_filter(queryset, field_name, value):
    """
    Para filtros tipo ciudad:
    si la BD tiene 'Mérida' y el usuario escribe 'Merida',
    intenta encontrarlo aunque no ponga acento.
    """
    if not value:
        return queryset

    normalized_value = normalize_text(value)

    if not normalized_value:
        return queryset

    q_filter = Q(**{f"{field_name}__icontains": value})

    if normalized_value != str(value).strip().lower():
        q_filter |= Q(**{f"{field_name}__icontains": normalized_value})

    matching_ids = []

    try:
        for obj in queryset.only("id", field_name):
            field_value = getattr(obj, field_name, "")

            if normalized_value in normalize_text(field_value):
                matching_ids.append(obj.id)
    except Exception:
        matching_ids = []

    if matching_ids:
        q_filter |= Q(id__in=matching_ids)

    return queryset.filter(q_filter).distinct()


def build_text_search_q(queryset, search):
    """
    Búsqueda flexible para title, description, city, location, etc.

    Permite cosas como:
    - hectarea
    - hectárea
    - hectareas
    - hectáreas
    - merida / mérida
    """
    search = str(search).strip()
    normalized_search = normalize_text(search)

    if not normalized_search:
        return Q()

    search_fields = get_existing_text_search_fields()

    if not search_fields:
        return Q()

    q_filter = Q()

    # Búsqueda normal en BD
    for field_name in search_fields:
        q_filter |= Q(**{f"{field_name}__icontains": search})

        if normalized_search != search.lower():
            q_filter |= Q(**{f"{field_name}__icontains": normalized_search})

    # Búsqueda palabra por palabra
    tokens = [
        token
        for token in normalized_search.split()
        if len(token) >= 3
    ]

    for token in tokens:
        for field_name in search_fields:
            q_filter |= Q(**{f"{field_name}__icontains": token})

    # Búsqueda con acentos quitados desde Python
    # Esto ayuda cuando la BD tiene 'Mérida' y escriben 'Merida'
    matching_ids = []

    try:
        for obj in queryset.only("id", *search_fields):
            combined_text = " ".join(
                str(getattr(obj, field_name, "") or "")
                for field_name in search_fields
            )

            normalized_combined_text = normalize_text(combined_text)

            if normalized_search in normalized_combined_text:
                matching_ids.append(obj.id)
                continue

            if any(token in normalized_combined_text for token in tokens):
                matching_ids.append(obj.id)
    except Exception:
        matching_ids = []

    if matching_ids:
        q_filter |= Q(id__in=matching_ids)

    return q_filter


def build_catalog_alias_search_q(search):
    """
    Si el usuario escribe en el buscador:
    'hectarea', 'hectáreas', 'lotes', 'rancho', 'renta', 'venta',
    aquí lo convertimos al valor real de la BD.
    """
    q_filter = Q()

    if field_exists(Property, "property_type"):
        valid_property_types = get_field_choice_values(Property, "property_type")
        property_type_values = resolve_search_alias_values(
            search,
            PROPERTY_TYPE_ALIASES,
            valid_property_types
        )

        for property_type_value in property_type_values:
            q_filter |= Q(property_type=property_type_value)

    if field_exists(Property, "listing_type"):
        valid_listing_types = get_field_choice_values(Property, "listing_type")
        listing_type_values = resolve_search_alias_values(
            search,
            LISTING_TYPE_ALIASES,
            valid_listing_types
        )

        for listing_type_value in listing_type_values:
            q_filter |= Q(listing_type=listing_type_value)

    if field_exists(Property, "status"):
        valid_status_values = get_field_choice_values(Property, "status")
        status_values = resolve_search_alias_values(
            search,
            STATUS_ALIASES,
            valid_status_values
        )

        for status_value in status_values:
            q_filter |= Q(status=status_value)

    if field_exists(Property, "credit_type"):
        valid_credit_values = get_field_choice_values(Property, "credit_type")
        credit_values = resolve_search_alias_values(
            search,
            CREDIT_TYPE_ALIASES,
            valid_credit_values
        )

        for credit_value in credit_values:
            q_filter |= Q(credit_type=credit_value)

    return q_filter


# ==============================
# 📄 LISTA DE PROPIEDADES (PÚBLICO)
# 🏗 CREAR PROPIEDAD (SOLO ADMIN)
# ==============================
class PropertyListView(generics.ListCreateAPIView):
    serializer_class = PropertySerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Property.objects.all()
        request = self.request

        # ==============================
        # 🔍 FILTROS
        # ==============================

        city = request.query_params.get("city")
        if city:
            queryset = apply_accent_insensitive_contains_filter(
                queryset,
                "city",
                city
            )

        min_price = request.query_params.get("min_price")
        if min_price:
            queryset = apply_decimal_filter(
                queryset,
                "price",
                "gte",
                min_price
            )

        max_price = request.query_params.get("max_price")
        if max_price:
            queryset = apply_decimal_filter(
                queryset,
                "price",
                "lte",
                max_price
            )

        property_type = request.query_params.get("property_type")
        if property_type and field_exists(Property, "property_type"):
            valid_property_types = get_field_choice_values(Property, "property_type")
            normalized_property_type = normalize_choice_value(
                property_type,
                PROPERTY_TYPE_ALIASES,
                valid_property_types
            )

            if normalized_property_type:
                queryset = queryset.filter(property_type=normalized_property_type)

        listing_type = request.query_params.get("listing_type")
        if listing_type and field_exists(Property, "listing_type"):
            valid_listing_types = get_field_choice_values(Property, "listing_type")
            normalized_listing_type = normalize_choice_value(
                listing_type,
                LISTING_TYPE_ALIASES,
                valid_listing_types
            )

            if normalized_listing_type:
                queryset = queryset.filter(listing_type=normalized_listing_type)

        status_param = request.query_params.get("status")
        if status_param and field_exists(Property, "status"):
            valid_status_values = get_field_choice_values(Property, "status")
            normalized_status = normalize_choice_value(
                status_param,
                STATUS_ALIASES,
                valid_status_values
            )

            if normalized_status:
                queryset = queryset.filter(status=normalized_status)

        credit_type = request.query_params.get("credit_type")
        if credit_type and field_exists(Property, "credit_type"):
            valid_credit_values = get_field_choice_values(Property, "credit_type")
            normalized_credit_type = normalize_choice_value(
                credit_type,
                CREDIT_TYPE_ALIASES,
                valid_credit_values
            )

            if normalized_credit_type:
                queryset = queryset.filter(credit_type=normalized_credit_type)

        # ==============================
        # 🔎 BÚSQUEDA FLEXIBLE
        # ==============================
        search = request.query_params.get("search")

        if search:
            text_search_q = build_text_search_q(queryset, search)
            catalog_alias_q = build_catalog_alias_search_q(search)

            final_search_q = text_search_q | catalog_alias_q

            if final_search_q.children:
                queryset = queryset.filter(final_search_q).distinct()

        # ==============================
        # 📊 ORDENAMIENTO
        # ==============================
        ordering = request.query_params.get("ordering")

        allowed_ordering_fields = {
            "id",
            "price",
            "created_at",
            "title",
            "city",
            "status",
            "property_type",
            "listing_type",
        }

        if ordering:
            ordering = ordering.strip()
            ordering_field = ordering[1:] if ordering.startswith("-") else ordering

            if ordering_field in allowed_ordering_fields:
                queryset = queryset.order_by(ordering)
            else:
                queryset = queryset.order_by("-id")
        else:
            queryset = queryset.order_by("-id")

        return queryset

    def get_serializer_context(self):
        return {"request": self.request}


# ==============================
# 📄 DETALLE DE PROPIEDAD (PÚBLICO)
# ==============================
class PropertyDetailView(generics.RetrieveAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [AllowAny]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


# ==============================
# ✏️ ACTUALIZAR PROPIEDAD (SOLO ADMIN)
# ==============================
class PropertyUpdateView(generics.UpdateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAdmin]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        property_updated = serializer.save()

        print("=== DEBUG PROPERTY UPDATE ===")
        print("MEDIA_ROOT:", settings.MEDIA_ROOT)
        print("MEDIA_URL:", settings.MEDIA_URL)

        if property_updated.video:
            print("Saved video name:", property_updated.video.name)
            try:
                print("Saved video path:", property_updated.video.path)
                print(
                    "File exists after save:",
                    os.path.exists(property_updated.video.path)
                )
            except Exception as e:
                print("Error getting video path:", str(e))
        else:
            print("No video present after save.")

        print("FILES received:", request.FILES)
        print("============================")

        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


# ==============================
# 🗑 ELIMINAR PROPIEDAD (SOLO ADMIN)
# ==============================
class PropertyDeleteView(generics.DestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAdmin]

    def delete(self, request, *args, **kwargs):
        property_obj = self.get_object()

        property_title = property_obj.title
        property_id = property_obj.id

        video_file = property_obj.video if property_obj.video else None
        image_files = [img.image for img in property_obj.images.all() if img.image]

        property_obj.delete()

        image_cleanup = delete_many_field_files(
            files=image_files,
            file_type="imagen de propiedad",
            retries=10,
            delay=0.4,
        )

        video_deleted = []
        video_failed = []

        if video_file:
            video_success = delete_field_file_with_retry(
                file_obj=video_file,
                file_type="video de propiedad",
                retries=10,
                delay=0.4,
            )

            if getattr(video_file, "name", None):
                if video_success:
                    video_deleted.append(video_file.name)
                else:
                    video_failed.append(video_file.name)

        return Response(
            {
                "message": "Propiedad eliminada correctamente.",
                "property_deleted": True,
                "property_id": property_id,
                "property_title": property_title,
                "file_cleanup": {
                    "deleted": image_cleanup["deleted"] + video_deleted,
                    "failed": image_cleanup["failed"] + video_failed,
                }
            },
            status=status.HTTP_200_OK
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


# ==============================
# 🎥 QUITAR VIDEO ARCHIVO (SOLO ADMIN)
# ==============================
class PropertyRemoveVideoView(generics.UpdateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAdmin]

    def patch(self, request, *args, **kwargs):
        property_obj = self.get_object()

        old_video = property_obj.video if property_obj.video else None

        property_obj.video = None
        property_obj.save(update_fields=["video"])

        cleanup_failed = []
        cleanup_deleted = []

        if old_video:
            success = delete_field_file_with_retry(
                file_obj=old_video,
                file_type="video de propiedad",
                retries=10,
                delay=0.4,
            )

            if getattr(old_video, "name", None):
                if success:
                    cleanup_deleted.append(old_video.name)
                else:
                    cleanup_failed.append(old_video.name)

        serializer = self.get_serializer(property_obj)
        response_data = serializer.data
        response_data["file_cleanup"] = {
            "deleted": cleanup_deleted,
            "failed": cleanup_failed,
        }

        return Response(response_data, status=status.HTTP_200_OK)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


# ==============================
# 🔗 QUITAR VIDEO URL (SOLO ADMIN)
# ==============================
class PropertyRemoveVideoURLView(generics.UpdateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAdmin]

    def patch(self, request, *args, **kwargs):
        property_obj = self.get_object()
        property_obj.video_url = None
        property_obj.save(update_fields=["video_url"])

        serializer = self.get_serializer(property_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


# ==============================
# ⬆️ SUBIR IMAGEN A PROPIEDAD (SOLO ADMIN)
# ==============================
class PropertyImageUploadView(generics.CreateAPIView):
    serializer_class = PropertyImageUploadSerializer
    permission_classes = [IsAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def get_property(self):
        return get_object_or_404(Property, pk=self.kwargs["property_id"])

    def create(self, request, *args, **kwargs):
        property_obj = self.get_property()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        property_image = serializer.save(property=property_obj)

        print("=== DEBUG IMAGE UPLOAD ===")
        print("MEDIA_ROOT:", settings.MEDIA_ROOT)
        print("MEDIA_URL:", settings.MEDIA_URL)
        print("Saved image name:", property_image.image.name)

        try:
            print("Saved image path:", property_image.image.path)
            print(
                "File exists after save:",
                os.path.exists(property_image.image.path)
            )
        except Exception as e:
            print("Error getting image path:", str(e))

        print("FILES received:", request.FILES)
        print("==========================")

        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ==============================
# 🗑 ELIMINAR IMAGEN DE PROPIEDAD (SOLO ADMIN)
# ==============================
class PropertyImageDeleteView(generics.DestroyAPIView):
    queryset = PropertyImage.objects.all()
    permission_classes = [IsAdmin]

    def delete(self, request, *args, **kwargs):
        image_obj = self.get_object()

        image_file = image_obj.image if image_obj.image else None
        image_id = image_obj.id

        image_obj.delete()

        cleanup_deleted = []
        cleanup_failed = []

        if image_file:
            success = delete_field_file_with_retry(
                file_obj=image_file,
                file_type="imagen de propiedad",
                retries=10,
                delay=0.4,
            )

            if getattr(image_file, "name", None):
                if success:
                    cleanup_deleted.append(image_file.name)
                else:
                    cleanup_failed.append(image_file.name)

        return Response(
            {
                "message": "Imagen eliminada correctamente.",
                "image_deleted": True,
                "image_id": image_id,
                "file_cleanup": {
                    "deleted": cleanup_deleted,
                    "failed": cleanup_failed,
                }
            },
            status=status.HTTP_200_OK
        )


# ==============================
# 🔄 CAMBIAR STATUS (ADMIN + SELLER)
# ==============================
class PropertyUpdateStatusView(generics.UpdateAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAdminOrSeller]

    def patch(self, request, *args, **kwargs):
        property_obj = self.get_object()

        new_status = request.data.get("status")

        if not new_status:
            return Response(
                {"error": "Debes enviar el campo 'status'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        valid_status = [choice[0] for choice in Property.STATUS_CHOICES]

        if new_status not in valid_status:
            return Response(
                {"error": "Status inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        property_obj.status = new_status
        property_obj.save(update_fields=["status"])

        serializer = self.get_serializer(property_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


# ==============================
# ⚙️ SETTINGS (PÚBLICO)
# ==============================
class SettingView(generics.ListAPIView):
    queryset = Setting.objects.all().order_by("-id")
    serializer_class = SettingSerializer
    permission_classes = [AllowAny]