from rest_framework import generics
from .models import Property
from .serializers import PropertySerializer


# 📄 LISTA DE PROPIEDADES (con filtros, búsqueda y ordenamiento)
class PropertyListView(generics.ListAPIView):
    serializer_class = PropertySerializer

    def get_queryset(self):
        queryset = Property.objects.all()
        request = self.request

        # ==============================
        # 🔍 FILTROS
        # ==============================

        # 📍 Filtro por ciudad (búsqueda parcial)
        city = request.GET.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)

        # 💰 Precio mínimo
        min_price = request.GET.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        # 💰 Precio máximo
        max_price = request.GET.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # 🏠 Tipo de propiedad (house, land, apartment)
        property_type = request.GET.get('property_type')
        if property_type:
            queryset = queryset.filter(property_type=property_type)

        # 🔄 Tipo de operación (sale, rent)
        listing_type = request.GET.get('listing_type')
        if listing_type:
            queryset = queryset.filter(listing_type=listing_type)

        # 📌 Estado (available, pending, sold)
        status = request.GET.get('status')
        if status:
            queryset = queryset.filter(status=status)

        # ==============================
        # 🔎 BÚSQUEDA GENERAL
        # ==============================

        search = request.GET.get('search')
        if search:
            queryset = (
                queryset.filter(title__icontains=search) |
                queryset.filter(description__icontains=search) |
                queryset.filter(city__icontains=search)
            )

        # ==============================
        # 📊 ORDENAMIENTO
        # ==============================

        # Ejemplos:
        # ?ordering=price
        # ?ordering=-price
        # ?ordering=created_at
        ordering = request.GET.get('ordering')
        if ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    # 🔐 Pasamos el request al serializer (para control de roles)
    def get_serializer_context(self):
        return {'request': self.request}


# 📄 DETALLE DE PROPIEDAD (por ID)
class PropertyDetailView(generics.RetrieveAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

    # 🔐 Igual aquí pasamos el request
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context