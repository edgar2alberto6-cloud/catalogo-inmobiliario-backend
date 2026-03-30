from django.contrib import admin
from django.urls import path, include

# 📁 Configuración para servir archivos media (imágenes/videos)
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    # 🛠 Panel de administración de Django
    path('admin/', admin.site.urls),

    # 🔗 API principal (todas las rutas de tu app properties)
    path('api/', include('properties.urls')),
]


# ==============================
# 📂 MEDIA FILES (SOLO DESARROLLO)
# ==============================
# Esto permite que puedas ver imágenes y videos desde el navegador
# Ejemplo: http://127.0.0.1:8000/media/property_images/xxx.jpg

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)