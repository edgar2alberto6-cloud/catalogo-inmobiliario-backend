from django.contrib import admin
from django.urls import path, include

# 🔥 JWT
from rest_framework_simplejwt.views import TokenRefreshView
from properties.jwt_views import CustomTokenObtainPairView

# 📁 Configuración para servir archivos media (imágenes/videos)
from django.conf import settings
from django.conf.urls.static import static


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
]

# ==============================
# 📂 MEDIA FILES
# ==============================
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)