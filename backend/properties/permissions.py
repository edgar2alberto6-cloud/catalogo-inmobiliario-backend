from rest_framework.permissions import BasePermission, SAFE_METHODS


# 👑 Admin → todo
class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


# 👀 Público → solo lectura
class IsPublicReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS


# 🧑‍💼 Vendedor → lectura + PATCH
class IsVendor(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


# 👑🧑‍💼 Admin o vendedor
class IsAdminOrSeller(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.is_staff)
        )