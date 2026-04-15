from django.db import models


class Property(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()

    price = models.DecimalField(max_digits=12, decimal_places=2)

    # 🧱 Precio por lote
    lot_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True
    )

    # 🔢 Cantidad de lotes
    total_lots = models.IntegerField(blank=True, null=True)

    location = models.CharField(max_length=255)
    city = models.CharField(max_length=100)

    STATUS_CHOICES = [
        ('available', 'Disponible'),
        ('pending', 'En proceso'),
        ('sold', 'Vendido'),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='available'
    )

    PROPERTY_TYPE_CHOICES = [
        ('house', 'Casa'),
        ('land', 'Terreno'),
        ('apartment', 'Departamento'),
    ]

    property_type = models.CharField(
        max_length=20,
        choices=PROPERTY_TYPE_CHOICES,
        default='house'
    )

    LISTING_TYPE_CHOICES = [
        ('sale', 'Venta'),
        ('rent', 'Renta'),
    ]

    listing_type = models.CharField(
        max_length=10,
        choices=LISTING_TYPE_CHOICES,
        default='sale'
    )

    # 🏦 TIPOS DE CRÉDITO
    class CreditType(models.TextChoices):
        NONE = 'none', 'Ninguno'
        INFONAVIT = 'infonavit', 'INFONAVIT'
        FOVISSSTE = 'fovissste', 'FOVISSSTE'
        BOTH = 'both', 'INFONAVIT y FOVISSSTE'

    credit_type = models.CharField(
        max_length=10,
        choices=CreditType.choices,
        default=CreditType.NONE
    )

    # 🎥 VIDEO
    video = models.FileField(upload_to='property_videos/', blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # 📌 CAMPOS EXTRA
    folio = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        unique=True
    )

    owner_name = models.CharField(max_length=255, blank=True, null=True)
    owner_phone = models.CharField(max_length=20, blank=True, null=True)

    google_maps_link = models.URLField(blank=True, null=True)

    payment_details = models.TextField(blank=True, null=True)

    measures = models.CharField(max_length=255, blank=True, null=True)
    specifications = models.TextField(blank=True, null=True)

    internal_notes = models.TextField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if self.folio is not None:
            self.folio = self.folio.strip()
            if self.folio == "":
                self.folio = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image = models.ImageField(upload_to='property_images/')
    is_private = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Imagen de {self.property.title}"


class Setting(models.Model):
    whatsapp_number = models.CharField(max_length=20)

    def __str__(self):
        return f"WhatsApp: {self.whatsapp_number}"