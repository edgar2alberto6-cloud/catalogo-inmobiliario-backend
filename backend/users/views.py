from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserSerializer
from .permissions import IsAdmin


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]


class UserDeleteView(APIView):
    permission_classes = [IsAdmin]

    def delete(self, request, pk):
        user = User.objects.get(pk=pk)

        if user == request.user:
            return Response(
                {"error": "No puedes eliminar tu propio usuario."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.is_superuser:
            admins_count = User.objects.filter(is_superuser=True).count()
            if admins_count <= 1:
                return Response(
                    {"error": "No puedes eliminar al último administrador."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        user.delete()
        return Response(
            {"message": "Usuario eliminado correctamente."},
            status=status.HTTP_200_OK
        )