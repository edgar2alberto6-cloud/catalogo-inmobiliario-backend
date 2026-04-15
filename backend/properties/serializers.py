import re
from rest_framework import serializers
from .models import Property, PropertyImage, Setting


def normalize_phone(phone):
    if not phone:
        return None

    return re.sub(r"\D", "", str(phone))


# ==============================
# 🖼 IMÁGENES
# ==============================
class PropertyImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'is_private']

    def get_image(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        # 👀 Cliente (no autenticado)
        if not request or not request.user.is_authenticated:
            # ❌ Si es privada → no devolver nada
            if data.get('is_private'):
                return None
            # ❌ Ocultar flag interna
            data.pop('is_private', None)

        return data


# ==============================
# ⬆️ SUBIDA DE IMAGEN INDIVIDUAL
# ==============================
class PropertyImageUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'is_private']


# ==============================
# 🏠 PROPIEDADES
# ==============================
class PropertySerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()

    # 🔥 Campos en español
    property_type_display = serializers.CharField(source='get_property_type_display', read_only=True)
    listing_type_display = serializers.CharField(source='get_listing_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    credit_type_display = serializers.CharField(source='get_credit_type_display', read_only=True)

    owner_phone = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = [
            'id',
            'created_at',
            'images',
            'property_type_display',
            'listing_type_display',
            'status_display',
            'credit_type_display',
        ]
        extra_kwargs = {
            'lot_price': {'required': False, 'allow_null': True},
            'total_lots': {'required': False, 'allow_null': True},
            'folio': {'required': False, 'allow_blank': True, 'allow_null': True},
            'owner_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'google_maps_link': {'required': False, 'allow_blank': True, 'allow_null': True},
            'payment_details': {'required': False, 'allow_blank': True, 'allow_null': True},
            'measures': {'required': False, 'allow_blank': True, 'allow_null': True},
            'specifications': {'required': False, 'allow_blank': True, 'allow_null': True},
            'internal_notes': {'required': False, 'allow_blank': True, 'allow_null': True},
            'video': {'required': False, 'allow_null': True},
            'video_url': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def to_internal_value(self, data):
        # ✅ NO usar data.copy() con multipart/form-data
        # porque al traer archivos (video) intenta hacer deepcopy
        # y truena con: cannot pickle 'BufferedRandom' instances
        if hasattr(data, "keys"):
            data = {key: data.get(key) for key in data.keys()}
        else:
            data = dict(data)

        # 🔧 convertir strings vacíos a null en campos numéricos opcionales
        nullable_numeric_fields = ['lot_price', 'total_lots']

        for field in nullable_numeric_fields:
            if field in data and data.get(field) == '':
                data[field] = None

        # 🔧 normalizar folio vacío
        if 'folio' in data:
            if data.get('folio') is None:
                data['folio'] = None
            else:
                data['folio'] = str(data.get('folio')).strip()
                if data['folio'] == '':
                    data['folio'] = None

        # 🔧 normalizar owner_phone vacío
        if 'owner_phone' in data:
            if data.get('owner_phone') is None:
                data['owner_phone'] = None
            else:
                data['owner_phone'] = str(data.get('owner_phone')).strip()
                if data['owner_phone'] == '':
                    data['owner_phone'] = None

        return super().to_internal_value(data)

    def validate_folio(self, value):
        if value is None:
            return None

        value = value.strip()

        if value == '':
            return None

        queryset = Property.objects.filter(folio=value)

        # ✅ Si estoy editando, excluir la misma propiedad
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError("Ya existe una propiedad con este folio.")

        return value

    def validate_owner_phone(self, value):
        if value in (None, ''):
            return None

        value = str(value).strip()

        if value == '':
            return None

        if not re.fullmatch(r'[0-9\s]+', value):
            raise serializers.ValidationError(
                "El teléfono solo puede contener números y espacios."
            )

        digits = re.sub(r'\D', '', value)

        if len(digits) < 10 or len(digits) > 15:
            raise serializers.ValidationError(
                "El teléfono debe tener entre 10 y 15 dígitos."
            )

        return digits

    # ==============================
    # 🖼 CONTROL DE IMÁGENES POR ROL
    # ==============================
    def get_images(self, obj):
        request = self.context.get('request')

        # 👀 Cliente → solo públicas
        if not request or not request.user.is_authenticated:
            images = obj.images.filter(is_private=False)
        else:
            user = request.user

            # 👑 Admin / 🧑‍💼 Vendedor → todas
            if user.is_superuser or user.is_staff:
                images = obj.images.all()
            else:
                images = obj.images.filter(is_private=False)

        serialized = PropertyImageSerializer(
            images,
            many=True,
            context=self.context
        ).data

        # 🔥 limpiar posibles None
        return [img for img in serialized if img is not None]

    # ==============================
    # 🔐 OCULTAR DATOS SENSIBLES
    # ==============================
    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')

        # 📞 devolver teléfono limpio, sin formato forzado
        if 'owner_phone' in data:
            data['owner_phone'] = normalize_phone(data.get('owner_phone'))

        # 👀 Cliente (no autenticado)
        if not request or not request.user.is_authenticated:
            return self.remove_sensitive_fields(data)

        user = request.user

        # 👑 Admin → ve todo
        if user.is_superuser:
            return data

        # 🧑‍💼 Vendedor → ve todo
        if user.is_staff:
            return data

        # 👀 Cliente autenticado
        return self.remove_sensitive_fields(data)

    # ==============================
    # 🚫 CAMPOS SENSIBLES
    # ==============================
    def remove_sensitive_fields(self, data):
        sensitive_fields = [
            'owner_name',
            'owner_phone',
            'internal_notes',
            'payment_details',
            'google_maps_link',
        ]

        for field in sensitive_fields:
            data.pop(field, None)

        return data


# ==============================
# ⚙️ SETTINGS
# ==============================
class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = '__all__'