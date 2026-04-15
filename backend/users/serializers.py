from django.contrib.auth.models import User
from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "is_active",
            "is_superuser",
            "is_staff",
            "role",
            "last_login",
            "date_joined",
        ]

    def get_role(self, obj):
        if obj.is_superuser:
            return "Admin"
        elif obj.is_staff:
            return "Vendedor"
        return "Usuario"

    def create(self, validated_data):
        password = validated_data.pop("password", None)

        user = User(**validated_data)

        if password:
            user.set_password(password)

        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance