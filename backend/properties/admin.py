from django.contrib import admin
from django.utils.html import format_html
from .models import Property, PropertyImage


# ==============================
# 📷 IMÁGENES INLINE
# ==============================
class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    readonly_fields = ['preview']

    def preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="100" />', obj.image.url)
        return "Sin imagen"

    preview.short_description = "Vista previa"


# ==============================
# 🏠 PROPIEDADES
# ==============================
@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    inlines = [PropertyImageInline]

    # 🔒 Campos solo lectura
    readonly_fields = ['video_preview', 'created_at']

    # 📋 Lista principal (tabla)
    list_display = [
        'title',
        'price',
        'lot_price',        # 🔥 nuevo
        'city',
        'status',
        'property_type',
        'listing_type',
        'created_at'
    ]

    # 🔍 Filtros laterales
    list_filter = [
        'status',
        'city',
        'property_type',
        'listing_type'
    ]

    # 🔎 Buscador
    search_fields = [
        'title',
        'description',
        'city',
        'folio'
    ]

    # 📂 Organización del formulario (MUY PRO)
    fieldsets = (

        # 🧾 Información básica
        ('Información general', {
            'fields': (
                'title',
                'description',
                'city',
                'location'
            )
        }),

        # 💰 Precios
        ('Precios', {
            'fields': (
                'price',
                'lot_price',     # 🔥 nuevo
                'total_lots'     # 🔥 nuevo
            )
        }),

        # 🏠 Clasificación
        ('Clasificación', {
            'fields': (
                'status',
                'property_type',
                'listing_type'
            )
        }),

        # 🎥 Multimedia
        ('Multimedia', {
            'fields': (
                'video',
                'video_preview'
            )
        }),

        # 🔐 Información interna (confidencial)
        ('Información interna', {
            'fields': (
                'folio',
                'owner_name',
                'owner_phone',
                'payment_details',
                'internal_notes',
                'google_maps_link'
            ),
            'classes': ('collapse',)  # 🔥 se puede contraer
        }),

        # ⚙️ Sistema
        ('Sistema', {
            'fields': (
                'created_at',
            )
        }),
    )

    # 🎥 Preview del video
    def video_preview(self, obj):
        if obj.video:
            return format_html(
                '<video width="200" controls><source src="{}" type="video/mp4"></video>',
                obj.video.url
            )
        return "Sin video"

    video_preview.short_description = "Vista previa del video"