from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve

# 🔥 JWT
from rest_framework_simplejwt.views import TokenRefreshView
from properties.jwt_views import CustomTokenObtainPairView


urlpatterns = [
    # 🛠 Panel de administración de Django
    path('admin/', admin.site.urls),

    # 🔐 LOGIN JWT personalizado
    path('api/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # 🔁 REFRESH TOKEN
    path('api/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # 🔗 API principal properties
    path('api/', include('properties.urls')),

    # 👤 API de usuarios
    path('api/', include('users.urls')),

    # 📂 MEDIA FILES EN PRODUCCIÓN
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT
    }),
]