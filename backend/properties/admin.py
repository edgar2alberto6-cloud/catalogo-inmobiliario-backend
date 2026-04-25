from django.contrib import admin
from django.utils.html import format_html
from .models import Property, PropertyImage, Setting


# ==============================
# 📷 IMÁGENES INLINE
# ==============================
class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ('image', 'is_private', 'preview')
    readonly_fields = ('preview',)

    def preview(self, obj):
        if obj and obj.image:
            return format_html('<img src="{}" width="100" />', obj.image.url)
        return "Sin imagen"

    preview.short_description = "Vista previa"


# ==============================
# 🏠 PROPIEDADES
# ==============================
@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    inlines = [PropertyImageInline]

    readonly_fields = ['video_preview', 'created_at']

    list_display = [
        'title',
        'price',
        'lot_price',
        'hectare_price',
        'city',
        'status',
        'property_type',
        'listing_type',
        'credit_type',
        'custom_financing',
        'created_at'
    ]

    list_filter = [
        'status',
        'city',
        'property_type',
        'listing_type',
        'credit_type',
        'custom_financing'
    ]

    search_fields = [
        'title',
        'description',
        'city',
        'folio',
        'custom_financing_details'
    ]

    fieldsets = (
        ('Información general', {
            'fields': (
                'title',
                'description',
                'city',
                'location'
            )
        }),

        ('Precios y medidas', {
            'fields': (
                'price',
                'lot_price',
                'total_lots',
                'hectare_price',
                'total_hectares',
                'measures',
                'specifications'
            )
        }),

        ('Clasificación', {
            'fields': (
                'status',
                'property_type',
                'listing_type',
                'credit_type',
                'custom_financing',
                'custom_financing_details'
            )
        }),

        ('Multimedia', {
            'fields': (
                'video',
                'video_url',
                'video_preview'
            )
        }),

        ('Información interna', {
            'fields': (
                'folio',
                'owner_name',
                'owner_phone',
                'payment_details',
                'internal_notes',
                'google_maps_link'
            ),
            'classes': ('collapse',)
        }),

        ('Sistema', {
            'fields': (
                'created_at',
            )
        }),
    )

    def video_preview(self, obj):
        if obj.video:
            return format_html(
                '<video width="200" controls><source src="{}" type="video/mp4"></video>',
                obj.video.url
            )
        if obj.video_url:
            return format_html(
                '<a href="{}" target="_blank" rel="noopener noreferrer">Ver video</a>',
                obj.video_url
            )
        return "Sin video"

    video_preview.short_description = "Vista previa del video"


# ==============================
# ⚙️ CONFIGURACIÓN GENERAL
# ==============================
@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ['whatsapp_number']