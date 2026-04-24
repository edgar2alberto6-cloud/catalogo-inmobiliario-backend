import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getPropertyDetail,
  updateProperty,
  uploadPropertyImage,
  deletePropertyImage,
  removePropertyVideo,
  removePropertyVideoUrl,
} from "../api/properties";
import PropertyFormGeneralSection from "../components/properties/form/PropertyFormGeneralSection";
import PropertyFormPricingSection from "../components/properties/form/PropertyFormPricingSection";
import PropertyFormClassificationSection from "../components/properties/form/PropertyFormClassificationSection";
import PropertyFormInternalSection from "../components/properties/form/PropertyFormInternalSection";

function sanitizePhoneInput(value) {
  const raw = String(value || "").replace(/[^\d\s]/g, "");

  let result = "";
  let digitCount = 0;
  let lastWasSpace = false;

  for (const char of raw) {
    if (/\d/.test(char)) {
      if (digitCount >= 15) {
        break;
      }

      result += char;
      digitCount += 1;
      lastWasSpace = false;
      continue;
    }

    if (char === " ") {
      if (!result || lastWasSpace) {
        continue;
      }

      result += " ";
      lastWasSpace = true;
    }
  }

  return result.trim();
}

function getPhoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function PropertyEdit() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    lot_price: "",
    hectare_price: "",
    location: "",
    city: "",
    measures: "",
    total_lots: "",
    total_hectares: "",
    specifications: "",
    property_type: "",
    listing_type: "",
    status: "",
    credit_type: "",
    folio: "",
    owner_name: "",
    owner_phone: "",
    internal_notes: "",
    payment_details: "",
    google_maps_link: "",
    video_url: "",
  });

  // imágenes
  const [imageFile, setImageFile] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);

  // video
  const [videoFile, setVideoFile] = useState(null);
  const [videoInputKey, setVideoInputKey] = useState(0);
  const [savingVideo, setSavingVideo] = useState(false);
  const [removingVideo, setRemovingVideo] = useState(false);
  const [removingVideoUrlState, setRemovingVideoUrlState] = useState(false);

  // guardado general
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "info", // success | error | warning | info
    title: "",
    message: "",
  });

  const openModal = ({ type = "info", title, message }) => {
    setModal({
      open: true,
      type,
      title,
      message,
    });
  };

  const closeModal = () => {
    setModal({
      open: false,
      type: "info",
      title: "",
      message: "",
    });
  };

  const getModalStyles = () => {
    if (modal.type === "success") {
      return {
        badge: "bg-emerald-100 text-emerald-700",
        button: "bg-emerald-600 hover:bg-emerald-700 text-white",
      };
    }

    if (modal.type === "warning") {
      return {
        badge: "bg-amber-100 text-amber-700",
        button: "bg-amber-500 hover:bg-amber-600 text-white",
      };
    }

    if (modal.type === "error") {
      return {
        badge: "bg-red-100 text-red-700",
        button: "bg-red-600 hover:bg-red-700 text-white",
      };
    }

    return {
      badge: "bg-gray-100 text-gray-700",
      button: "bg-gray-800 hover:bg-gray-900 text-white",
    };
  };

  const extractBackendErrorMessage = (backendErrors) => {
    if (!backendErrors) {
      return "No se pudieron guardar los cambios.";
    }

    if (typeof backendErrors === "string") {
      return backendErrors;
    }

    if (backendErrors.detail) {
      return backendErrors.detail;
    }

    const priorityFields = [
      "folio",
      "title",
      "price",
      "location",
      "city",
      "owner_phone",
      "video",
      "video_url",
      "non_field_errors",
    ];

    const labels = {
      folio: "Folio",
      title: "Título",
      price: "Precio",
      location: "Ubicación",
      city: "Ciudad",
      owner_phone: "Teléfono",
      video: "Video",
      video_url: "URL del video",
      non_field_errors: "Error",
    };

    for (const field of priorityFields) {
      if (backendErrors[field]) {
        const value = backendErrors[field];
        const message = Array.isArray(value) ? value[0] : value;
        return `${labels[field]}: ${message}`;
      }
    }

    const firstKey = Object.keys(backendErrors)[0];

    if (firstKey) {
      const value = backendErrors[firstKey];
      const message = Array.isArray(value) ? value[0] : value;
      return `${firstKey}: ${message}`;
    }

    return "No se pudieron guardar los cambios.";
  };

  const fetchProperty = async () => {
    try {
      const data = await getPropertyDetail(id);
      setProperty(data);

      setFormData({
        title: data.title ?? "",
        description: data.description ?? "",
        price: data.price ?? "",
        lot_price: data.lot_price ?? "",
        hectare_price: data.hectare_price ?? "",
        location: data.location ?? "",
        city: data.city ?? "",
        measures: data.measures ?? "",
        total_lots: data.total_lots ?? "",
        total_hectares: data.total_hectares ?? "",
        specifications: data.specifications ?? "",
        property_type: data.property_type ?? "",
        listing_type: data.listing_type ?? "",
        status: data.status ?? "",
        credit_type: data.credit_type ?? "",
        folio: data.folio ?? "",
        owner_name: data.owner_name ?? "",
        owner_phone: data.owner_phone ?? "",
        internal_notes: data.internal_notes ?? "",
        payment_details: data.payment_details ?? "",
        google_maps_link: data.google_maps_link ?? "",
        video_url: data.video_url ?? "",
      });
    } catch (error) {
      console.error("Error al cargar propiedad:", error);
      openModal({
        type: "error",
        title: "No se pudo cargar la propiedad",
        message: "Hubo un problema al obtener la información de la propiedad.",
      });
    }
  };

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const getEmbedVideoUrl = (url) => {
    if (!url) return null;

    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes("youtube.com/watch")) {
      try {
        const parsed = new URL(url);
        const videoId = parsed.searchParams.get("v");
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      } catch (error) {
        console.error("URL de YouTube inválida:", error);
      }
    }

    if (url.includes("youtube.com/shorts/")) {
      const videoId = url.split("youtube.com/shorts/")[1]?.split("?")[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes("youtube.com/embed/")) {
      return url;
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "owner_phone") {
      setFormData((prev) => ({
        ...prev,
        owner_phone: sanitizePhoneInput(value),
      }));
      return;
    }

    if (name === "property_type") {
      setFormData((prev) => {
        if (value === "lots") {
          return {
            ...prev,
            property_type: value,
            hectare_price: "",
            total_hectares: "",
          };
        }

        if (value === "hectares") {
          return {
            ...prev,
            property_type: value,
            lot_price: "",
            total_lots: "",
          };
        }

        return {
          ...prev,
          property_type: value,
          lot_price: "",
          total_lots: "",
          hectare_price: "",
          total_hectares: "",
        };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePhoneBeforeSubmit = () => {
    const digits = getPhoneDigits(formData.owner_phone);

    if (!digits) {
      return { valid: true, value: null };
    }

    if (digits.length < 10 || digits.length > 15) {
      return {
        valid: false,
        message: "El teléfono debe tener entre 10 y 15 dígitos.",
      };
    }

    return {
      valid: true,
      value: digits,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneValidation = validatePhoneBeforeSubmit();

    if (!phoneValidation.valid) {
      openModal({
        type: "error",
        title: "Teléfono inválido",
        message: phoneValidation.message,
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: formData.title,
        description: formData.description,
        price: formData.price === "" ? null : formData.price,
        lot_price: formData.lot_price === "" ? null : formData.lot_price,
        hectare_price:
          formData.hectare_price === "" ? null : formData.hectare_price,
        location: formData.location,
        city: formData.city,
        measures: formData.measures,
        total_lots: formData.total_lots === "" ? null : formData.total_lots,
        total_hectares:
          formData.total_hectares === "" ? null : formData.total_hectares,
        specifications: formData.specifications,
        property_type: formData.property_type,
        listing_type: formData.listing_type,
        status: formData.status,
        credit_type: formData.credit_type,
        folio: formData.folio,
        owner_name: formData.owner_name,
        owner_phone: phoneValidation.value,
        internal_notes: formData.internal_notes,
        payment_details: formData.payment_details,
        google_maps_link: formData.google_maps_link,
      };

      const updatedProperty = await updateProperty(id, payload);

      setProperty(updatedProperty);
      setFormData((prev) => ({
        ...prev,
        owner_phone: updatedProperty.owner_phone ?? "",
      }));

      openModal({
        type: "success",
        title: "Cambios guardados",
        message: "La propiedad se actualizó correctamente.",
      });
    } catch (error) {
      console.error("Error al guardar propiedad:", error);

      if (error.response?.data) {
        console.error("Detalle del error:", error.response.data);

        openModal({
          type: "error",
          title: "No se pudieron guardar los cambios",
          message: extractBackendErrorMessage(error.response.data),
        });
      } else {
        openModal({
          type: "error",
          title: "Error de conexión",
          message: "No se pudieron guardar los cambios por un problema del servidor o de conexión.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleVideoSave = async (e) => {
    e.preventDefault();

    try {
      setSavingVideo(true);

      const uploadData = new FormData();

      if (videoFile) {
        uploadData.append("video", videoFile);
      }

      uploadData.append("video_url", (formData.video_url || "").trim());

      const updatedProperty = await updateProperty(id, uploadData);

      setProperty(updatedProperty);
      setFormData((prev) => ({
        ...prev,
        video_url: updatedProperty.video_url ?? "",
      }));
      setVideoFile(null);
      setVideoInputKey((prev) => prev + 1);

      openModal({
        type: "success",
        title: "Multimedia actualizada",
        message: "El video y/o la URL del video se actualizaron correctamente.",
      });
    } catch (error) {
      console.error("Error al guardar video:", error);

      if (error.response?.data) {
        console.error("Detalle del error:", error.response.data);
      }

      openModal({
        type: "error",
        title: "No se pudo actualizar la multimedia",
        message: "Hubo un problema al guardar el video o la URL del video.",
      });
    } finally {
      setSavingVideo(false);
    }
  };

  const handleRemoveVideo = async () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar el video subido?"
    );

    if (!confirmed) return;

    try {
      setRemovingVideo(true);

      const updatedProperty = await removePropertyVideo(id);

      setProperty(updatedProperty);
      setVideoFile(null);
      setVideoInputKey((prev) => prev + 1);

      openModal({
        type: "success",
        title: "Video eliminado",
        message: "El archivo de video se eliminó correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar video:", error);

      openModal({
        type: "error",
        title: "No se pudo eliminar el video",
        message: "Hubo un problema al intentar eliminar el archivo de video.",
      });
    } finally {
      setRemovingVideo(false);
    }
  };

  const handleRemoveVideoUrl = async () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar el video URL?"
    );

    if (!confirmed) return;

    try {
      setRemovingVideoUrlState(true);

      const updatedProperty = await removePropertyVideoUrl(id);

      setProperty(updatedProperty);
      setFormData((prev) => ({
        ...prev,
        video_url: "",
      }));

      openModal({
        type: "success",
        title: "URL eliminada",
        message: "La URL del video se eliminó correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar video URL:", error);

      openModal({
        type: "error",
        title: "No se pudo eliminar la URL",
        message: "Hubo un problema al intentar eliminar la URL del video.",
      });
    } finally {
      setRemovingVideoUrlState(false);
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      openModal({
        type: "warning",
        title: "Falta imagen",
        message: "Selecciona una imagen antes de subirla.",
      });
      return;
    }

    try {
      setUploadingImage(true);

      const uploadData = new FormData();
      uploadData.append("image", imageFile);
      uploadData.append("is_private", isPrivate ? "true" : "false");

      await uploadPropertyImage(id, uploadData);

      setImageFile(null);
      setIsPrivate(false);

      e.target.reset();
      await fetchProperty();

      openModal({
        type: "success",
        title: "Imagen subida",
        message: "La imagen se subió correctamente.",
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);

      openModal({
        type: "error",
        title: "No se pudo subir la imagen",
        message: "Hubo un problema al intentar subir la imagen.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar esta imagen?"
    );

    if (!confirmed) return;

    try {
      setDeletingImageId(imageId);

      await deletePropertyImage(imageId);
      await fetchProperty();

      openModal({
        type: "success",
        title: "Imagen eliminada",
        message: "La imagen se eliminó correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar imagen:", error);

      openModal({
        type: "error",
        title: "No se pudo eliminar la imagen",
        message: "Hubo un problema al intentar eliminar la imagen.",
      });
    } finally {
      setDeletingImageId(null);
    }
  };

  if (!property) return <p className="p-6">Cargando propiedad...</p>;

  const embedVideoUrl = getEmbedVideoUrl(formData.video_url);
  const modalStyles = getModalStyles();
  const ownerPhoneDigits = getPhoneDigits(formData.owner_phone);

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Panel de edición</p>
              <h1 className="text-3xl font-bold">Editar propiedad</h1>
              <p className="text-gray-600 mt-1">
                {property.title} · {property.city}
              </p>
            </div>

            <Link
              to={`/admin/property/${id}`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl border bg-white hover:bg-gray-100"
            >
              Volver al detalle
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Imágenes</h2>

            {property.images?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {property.images.map((img) => (
                  <div
                    key={img.id}
                    className="border rounded-xl overflow-hidden bg-gray-50"
                  >
                    <img
                      src={img.image}
                      alt="Propiedad"
                      className="w-full h-40 object-cover"
                    />

                    <div className="p-3 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">
                          ID imagen: {img.id}
                        </span>

                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            img.is_private
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {img.is_private ? "Privada" : "Pública"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={deletingImageId === img.id}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingImageId === img.id
                          ? "Eliminando..."
                          : "Eliminar imagen"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">
                Esta propiedad aún no tiene imágenes.
              </p>
            )}

            <form
              onSubmit={handleImageUpload}
              className="border-t pt-6 space-y-4"
            >
              <h3 className="text-lg font-semibold">Subir nueva imagen</h3>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0] || null)}
                  className="block w-full border rounded-xl px-4 py-2 bg-white"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                Marcar como imagen privada
              </label>

              <button
                type="submit"
                disabled={uploadingImage}
                className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                {uploadingImage ? "Subiendo..." : "Subir imagen"}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Video</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Video subido</h3>

                {property.video ? (
                  <div className="space-y-3">
                    <video
                      src={property.video}
                      controls
                      className="w-full max-w-2xl rounded-xl border bg-black"
                    />
                    <a
                      href={property.video}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      Ver archivo de video
                    </a>
                  </div>
                ) : (
                  <p className="text-gray-500">No hay video subido actualmente.</p>
                )}
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Video URL</h3>

                {formData.video_url ? (
                  <div className="space-y-3">
                    <a
                      href={formData.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {formData.video_url}
                    </a>

                    {embedVideoUrl && (
                      <div className="aspect-video w-full max-w-2xl">
                        <iframe
                          src={embedVideoUrl}
                          title="Vista previa del video"
                          className="w-full h-full rounded-xl border"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No hay video URL registrado actualmente.
                  </p>
                )}
              </div>

              <form onSubmit={handleVideoSave} className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold">Actualizar multimedia</h3>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subir o reemplazar video
                  </label>
                  <input
                    key={videoInputKey}
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0] || null)}
                    className="block w-full border rounded-xl px-4 py-2 bg-white"
                  />

                  {videoFile && (
                    <div className="mt-2 flex items-center gap-3">
                      <p className="text-sm text-gray-600 break-all">
                        Archivo seleccionado: {videoFile.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null);
                          setVideoInputKey((prev) => prev + 1);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Video URL
                  </label>
                  <input
                    type="text"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleChange}
                    placeholder="https://youtu.be/..."
                    className="w-full border rounded-xl px-4 py-2"
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={savingVideo}
                    className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                  >
                    {savingVideo ? "Guardando..." : "Guardar multimedia"}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveVideo}
                    disabled={removingVideo || !property.video}
                    className="bg-red-600 text-white px-5 py-2 rounded-xl hover:bg-red-700 disabled:opacity-50"
                  >
                    {removingVideo ? "Quitando video..." : "Quitar video archivo"}
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveVideoUrl}
                    disabled={removingVideoUrlState || !property.video_url}
                    className="bg-amber-600 text-white px-5 py-2 rounded-xl hover:bg-amber-700 disabled:opacity-50"
                  >
                    {removingVideoUrlState
                      ? "Quitando URL..."
                      : "Quitar video URL"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <PropertyFormGeneralSection
              formData={formData}
              onChange={handleChange}
            />

            <PropertyFormPricingSection
              formData={formData}
              onChange={handleChange}
            />

            <PropertyFormClassificationSection
              formData={formData}
              onChange={handleChange}
            />

            <PropertyFormInternalSection
              formData={formData}
              onChange={handleChange}
            />

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Sistema</h2>
              <p className="text-gray-600">
                Creado el:{" "}
                {property.created_at
                  ? new Date(property.created_at).toLocaleString()
                  : "Sin fecha"}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Guardar cambios</h2>
                  <p className="text-gray-600 text-sm">
                    Actualiza la información general de la propiedad.
                  </p>

                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <p>Teléfono: opcional, entre 10 y 15 dígitos.</p>

                    {ownerPhoneDigits.length > 0 && (
                      <p>
                        Dígitos capturados:{" "}
                        <span className="font-medium text-gray-700">
                          {ownerPhoneDigits.length}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl p-6 animate-[fadeIn_.2s_ease-out]">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${modalStyles.badge}`}
              >
                {modal.type === "success" && "Correcto"}
                {modal.type === "warning" && "Atención"}
                {modal.type === "error" && "Error"}
                {modal.type === "info" && "Información"}
              </span>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {modal.title}
            </h3>

            <p className="text-gray-600 whitespace-pre-line">
              {modal.message}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className={`px-5 py-2.5 rounded-xl transition ${modalStyles.button}`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PropertyEdit;
