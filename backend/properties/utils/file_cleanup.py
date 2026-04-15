import logging
import time
from typing import Iterable, List, Dict, Any

logger = logging.getLogger(__name__)


def _extract_storage_and_name(file_obj):
    """
    Acepta un FieldFile de Django y devuelve (storage, file_name).
    Si no se puede extraer, devuelve (None, None).
    """
    if not file_obj:
        return None, None

    storage = getattr(file_obj, "storage", None)
    file_name = getattr(file_obj, "name", None)

    if not storage or not file_name:
        return None, None

    return storage, file_name


def delete_field_file_with_retry(
    file_obj,
    file_type="archivo",
    retries=8,
    delay=0.35,
) -> bool:
    """
    Intenta borrar un archivo físico asociado a un FieldFile de Django.
    Hace varios intentos por si Windows lo tiene bloqueado temporalmente.

    Retorna:
        True  -> si se borró o ya no existía
        False -> si no se pudo borrar después de varios intentos
    """
    storage, file_name = _extract_storage_and_name(file_obj)

    if not storage or not file_name:
        return True

    # Intentar cerrar el archivo si está abierto
    try:
        file_obj.close()
    except Exception:
        pass

    # Si ya no existe, lo consideramos resuelto
    try:
        if not storage.exists(file_name):
            return True
    except Exception as e:
        logger.warning(
            f"No se pudo verificar existencia de {file_type} '{file_name}': {e}"
        )

    last_error = None

    for attempt in range(1, retries + 1):
        try:
            if storage.exists(file_name):
                storage.delete(file_name)
            return True

        except FileNotFoundError:
            return True

        except PermissionError as e:
            last_error = e
            logger.warning(
                f"Intento {attempt}/{retries} - "
                f"No se pudo borrar {file_type} '{file_name}' por bloqueo de archivo: {e}"
            )

        except OSError as e:
            last_error = e
            logger.warning(
                f"Intento {attempt}/{retries} - "
                f"No se pudo borrar {file_type} '{file_name}' por error del sistema: {e}"
            )

        except Exception as e:
            last_error = e
            logger.exception(
                f"Intento {attempt}/{retries} - "
                f"Error inesperado al borrar {file_type} '{file_name}': {e}"
            )

        if attempt < retries:
            time.sleep(delay)

    logger.error(
        f"No se pudo borrar {file_type} '{file_name}' después de {retries} intentos. "
        f"Último error: {last_error}"
    )
    return False


def delete_many_field_files(
    files: Iterable,
    file_type="archivo",
    retries=8,
    delay=0.35,
) -> Dict[str, List[Any]]:
    """
    Borra varios FieldFile y devuelve un resumen.

    Retorna un dict:
    {
        "deleted": [<nombres de archivo>],
        "failed": [<nombres de archivo>]
    }
    """
    deleted = []
    failed = []

    for file_obj in files:
        file_name = getattr(file_obj, "name", None)

        success = delete_field_file_with_retry(
            file_obj=file_obj,
            file_type=file_type,
            retries=retries,
            delay=delay,
        )

        if success:
            if file_name:
                deleted.append(file_name)
        else:
            if file_name:
                failed.append(file_name)

    return {
        "deleted": deleted,
        "failed": failed,
    }