from rest_framework import serializers
from .models import Property, PropertyImage

class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image']


class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = '__all__'

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request', None)

        # 🔒 Si no hay usuario (público)
        if not request or not request.user.is_authenticated:
            self.remove_sensitive_fields(data)
            return data

        user = request.user

        # 👀 Cliente
        if user.groups.filter(name='Cliente').exists():
            self.remove_sensitive_fields(data)

        return data

    def remove_sensitive_fields(self, data):
        sensitive_fields = [
            'owner_name',
            'owner_phone',
            'internal_notes',
            'payment_details'
        ]

        for field in sensitive_fields:
            data.pop(field, None)

        return data