import os

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
            queryset = queryset.filter(city__icontains=city)

        min_price = request.query_params.get("min_price")
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        max_price = request.query_params.get("max_price")
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        property_type = request.query_params.get("property_type")
        if property_type:
            queryset = queryset.filter(property_type=property_type)

        listing_type = request.query_params.get("listing_type")
        if listing_type:
            queryset = queryset.filter(listing_type=listing_type)

        status_param = request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param)

        credit_type = request.query_params.get("credit_type")
        if credit_type:
            queryset = queryset.filter(credit_type=credit_type)

        # ==============================
        # 🔎 BÚSQUEDA
        # ==============================
        search = request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(city__icontains=search)
            )

        # ==============================
        # 📊 ORDENAMIENTO
        # ==============================
        ordering = request.query_params.get("ordering")
        if ordering:
            queryset = queryset.order_by(ordering)
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