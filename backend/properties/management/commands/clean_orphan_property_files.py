from pathlib import Path

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand

from properties.models import Property, PropertyImage


class Command(BaseCommand):
    help = "Limpia imágenes y videos huérfanos en MEDIA_ROOT que ya no están referenciados en la base de datos."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Solo muestra qué archivos se borrarían, sin borrarlos realmente.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        media_root = Path(settings.MEDIA_ROOT)
        image_dir = media_root / "property_images"
        video_dir = media_root / "property_videos"

        # =========================
        # Archivos referenciados en BD
        # =========================
        referenced_images = set()
        referenced_videos = set()

        for image in PropertyImage.objects.exclude(image="").exclude(image__isnull=True):
            referenced_images.add(Path(image.image.name).as_posix())

        for prop in Property.objects.exclude(video="").exclude(video__isnull=True):
            referenced_videos.add(Path(prop.video.name).as_posix())

        # =========================
        # Buscar huérfanos
        # =========================
        orphan_images = self.find_orphans(
            base_dir=image_dir,
            media_root=media_root,
            referenced_files=referenced_images,
        )

        orphan_videos = self.find_orphans(
            base_dir=video_dir,
            media_root=media_root,
            referenced_files=referenced_videos,
        )

        total_orphans = len(orphan_images) + len(orphan_videos)

        self.stdout.write("")
        self.stdout.write(self.style.WARNING("=== RESUMEN DE LIMPIEZA ==="))
        self.stdout.write(f"Imágenes huérfanas: {len(orphan_images)}")
        self.stdout.write(f"Videos huérfanos: {len(orphan_videos)}")
        self.stdout.write(f"Total: {total_orphans}")
        self.stdout.write("")

        if total_orphans == 0:
            self.stdout.write(self.style.SUCCESS("No se encontraron archivos huérfanos."))
            return

        # Mostrar archivos encontrados
        if orphan_images:
            self.stdout.write(self.style.WARNING("Imágenes huérfanas:"))
            for file_path in orphan_images:
                self.stdout.write(f" - {file_path}")

        if orphan_videos:
            self.stdout.write(self.style.WARNING("Videos huérfanos:"))
            for file_path in orphan_videos:
                self.stdout.write(f" - {file_path}")

        self.stdout.write("")

        if dry_run:
            self.stdout.write(
                self.style.WARNING("Modo dry-run activado: no se borró ningún archivo.")
            )
            return

        # =========================
        # Borrar huérfanos
        # =========================
        deleted_count = 0
        failed_count = 0

        for file_path in orphan_images + orphan_videos:
            try:
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
                    self.stdout.write(self.style.SUCCESS(f"Borrado: {file_path}"))
                    deleted_count += 1
                else:
                    self.stdout.write(f"No existe en storage: {file_path}")
            except Exception as e:
                self.stderr.write(f"Error al borrar {file_path}: {e}")
                failed_count += 1

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS(f"Archivos borrados: {deleted_count}"))

        if failed_count > 0:
            self.stdout.write(
                self.style.WARNING(f"Archivos con error al borrar: {failed_count}")
            )

    def find_orphans(self, base_dir, media_root, referenced_files):
        """
        Recorre una carpeta dentro de MEDIA_ROOT y devuelve los archivos que no están
        referenciados en la base de datos.
        """
        orphans = []

        if not base_dir.exists():
            return orphans

        for file in base_dir.rglob("*"):
            if file.is_file():
                relative_path = file.relative_to(media_root).as_posix()

                if relative_path not in referenced_files:
                    orphans.append(relative_path)

        return orphans