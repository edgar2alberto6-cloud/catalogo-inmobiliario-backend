from django.urls import path
from .views import (
    PropertyListView,
    PropertyDetailView,
    SettingView,
    PropertyUpdateView,
    PropertyDeleteView,
    PropertyUpdateStatusView,
    PropertyImageUploadView,
    PropertyImageDeleteView,
    PropertyRemoveVideoView,
    PropertyRemoveVideoURLView,
)

urlpatterns = [
    # 📄 PROPIEDADES
    # GET  /properties/        -> listar
    # POST /properties/        -> crear (solo admin)
    path('properties/', PropertyListView.as_view()),

    # 📄 DETALLE DE PROPIEDAD
    path('properties/<int:pk>/', PropertyDetailView.as_view()),

    # ✏️ ACTUALIZAR PROPIEDAD COMPLETA
    path('properties/<int:pk>/update/', PropertyUpdateView.as_view()),

    # 🗑 ELIMINAR PROPIEDAD
    path('properties/<int:pk>/delete/', PropertyDeleteView.as_view()),

    # 🎥 QUITAR VIDEO ARCHIVO
    path('properties/<int:pk>/remove-video/', PropertyRemoveVideoView.as_view()),

    # 🔗 QUITAR VIDEO URL
    path('properties/<int:pk>/remove-video-url/', PropertyRemoveVideoURLView.as_view()),

    # ⬆️ SUBIR IMAGEN A UNA PROPIEDAD
    path('properties/<int:property_id>/upload-image/', PropertyImageUploadView.as_view()),

    # 🗑 ELIMINAR IMAGEN
    path('property-images/<int:pk>/delete/', PropertyImageDeleteView.as_view()),

    # 🔄 CAMBIAR STATUS
    path('properties/<int:pk>/status/', PropertyUpdateStatusView.as_view()),

    # ⚙️ SETTINGS
    path('settings/', SettingView.as_view()),
]