from django.urls import path
from .views import UserListView, UserCreateView, UserDetailView, UserUpdateView, UserDeleteView

urlpatterns = [
    path("users/", UserListView.as_view(), name="users-list"),
    path("users/create/", UserCreateView.as_view(), name="users-create"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="users-detail"),
    path("users/<int:pk>/update/", UserUpdateView.as_view(), name="users-update"),
    path("users/<int:pk>/delete/", UserDeleteView.as_view(), name="users-delete"),
]