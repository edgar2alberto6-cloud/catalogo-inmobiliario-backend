import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createProperty,
  updateProperty,
  uploadPropertyImage,
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

function PropertyCreate() {
  const navigate = useNavigate();

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
    property_type: "house",
    listing_type: "sale",
    status: "available",
    credit_type: "none",
    custom_financing: false,
    custom_financing_details: "",
    folio: "",
    owner_name: "",
    owner_phone: "",
    internal_notes: "",
    payment_details: "",
    google_maps_link: "",
    video_url: "",
  });

  const [pendingImages, setPendingImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoInputKey, setVideoInputKey] = useState(0);

  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    redirectTo: null,
  });

  const openModal = ({ type = "info", title, message, redirectTo = null }) => {
    setModal({
      open: true,
      type,
      title,
      message,
      redirectTo,
    });
  };

  const closeModal = () => {
    const redirectTo = modal.redirectTo;

    setModal({
      open: false,
      type: "info",
      title: "",
      message: "",
      redirectTo: null,
    });

    if (redirectTo) {
      navigate(redirectTo);
    }
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
      return "No se pudo crear la propiedad.";
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
      "custom_financing_details",
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
      custom_financing_details: "Financiamiento adicional",
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

    return "No se pudo crear la propiedad.";
  };

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
    const { name, value, type, checked } = e.target;

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

    if (name === "custom_financing") {
      setFormData((prev) => ({
        ...prev,
        custom_financing: checked,
        custom_financing_details: checked
          ? prev.custom_financing_details
          : "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImagesSelected = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const newItems = files.map((file, index) => ({
      tempId: `${file.name}-${file.size}-${Date.now()}-${index}`,
      file,
      is_private: false,
    }));

    setPendingImages((prev) => [...prev, ...newItems]);

    e.target.value = "";
  };

  const handleToggleImagePrivate = (tempId) => {
    setPendingImages((prev) =>
      prev.map((img) =>
        img.tempId === tempId
          ? { ...img, is_private: !img.is_private }
          : img
      )
    );
  };

  const handleRemovePendingImage = (tempId) => {
    setPendingImages((prev) => prev.filter((img) => img.tempId !== tempId));
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

    let createdProperty = null;

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
        custom_financing: formData.custom_financing,
        custom_financing_details: formData.custom_financing
          ? (formData.custom_financing_details || "").trim() || null
          : null,
        folio: formData.folio,
        owner_name: formData.owner_name,
        owner_phone: phoneValidation.value,
        internal_notes: formData.internal_notes,
        payment_details: formData.payment_details,
        google_maps_link: formData.google_maps_link,
      };

      createdProperty = await createProperty(payload);

      const propertyId = createdProperty.id;
      const issues = [];

      for (const image of pendingImages) {
        try {
          const uploadData = new FormData();
          uploadData.append("image", image.file);
          uploadData.append(
            "is_private",
            image.is_private ? "true" : "false"
          );

          await uploadPropertyImage(propertyId, uploadData);
        } catch (error) {
          console.error("Error al subir imagen:", error);
          issues.push(`imagen: ${image.file.name}`);
        }
      }

      const trimmedVideoUrl = (formData.video_url || "").trim();

      if (videoFile || trimmedVideoUrl) {
        try {
          const mediaData = new FormData();

          if (videoFile) {
            mediaData.append("video", videoFile);
          }

          mediaData.append("video_url", trimmedVideoUrl);

          await updateProperty(propertyId, mediaData);
        } catch (error) {
          console.error("Error al guardar video:", error);
          issues.push("video");
        }
      }

      if (issues.length > 0) {
        openModal({
          type: "warning",
          title: "Propiedad creada con detalles por revisar",
          message: `La propiedad sí se creó, pero hubo problemas con: ${issues.join(
            ", "
          )}. Al cerrar este mensaje te mandaré al detalle para revisarla.`,
          redirectTo: `/property/${propertyId}`,
        });
        return;
      }

      openModal({
        type: "success",
        title: "Propiedad creada correctamente",
        message:
          "La propiedad y su multimedia se guardaron correctamente. Al cerrar este mensaje te mandaré al detalle.",
        redirectTo: `/property/${propertyId}`,
      });
    } catch (error) {
      console.error("Error al crear propiedad:", error);

      if (createdProperty?.id) {
        openModal({
          type: "warning",
          title: "Creación parcial completada",
          message:
            "La propiedad base sí se creó, pero hubo problemas al terminar la multimedia.",
          redirectTo: `/property/${createdProperty.id}`,
        });
      } else if (error.response?.data) {
        console.error("Detalle del error:", error.response.data);

        openModal({
          type: "error",
          title: "No se pudo crear la propiedad",
          message: extractBackendErrorMessage(error.response.data),
        });
      } else {
        openModal({
          type: "error",
          title: "Error de conexión",
          message:
            "No se pudo crear la propiedad por un problema de conexión o del servidor.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const embedVideoUrl = getEmbedVideoUrl(formData.video_url);
  const modalStyles = getModalStyles();
  const ownerPhoneDigits = getPhoneDigits(formData.owner_phone);

  return (
    <>
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Panel de creación</p>
              <h1 className="text-3xl font-bold">Nueva propiedad</h1>
              <p className="text-gray-600 mt-1">
                Crea la propiedad y sube su multimedia en un solo flujo.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl border bg-white hover:bg-gray-100"
            >
              Volver al inicio
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <PropertyFormGeneralSection
              formData={formData}
              onChange={handleChange}
            />

            <PropertyFormClassificationSection
              formData={formData}
              onChange={handleChange}
            />

            <PropertyFormPricingSection
              formData={formData}
              onChange={handleChange}
            />

            <PropertyFormInternalSection
              formData={formData}
              onChange={handleChange}
            />

            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Imágenes</h2>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesSelected}
                  className="block w-full border rounded-xl px-4 py-2 bg-white"
                />
              </div>

              {pendingImages.length > 0 ? (
                <div className="space-y-3">
                  {pendingImages.map((img) => (
                    <div
                      key={img.tempId}
                      className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <p className="font-medium break-all">{img.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(img.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-3 md:items-center">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={img.is_private}
                            onChange={() =>
                              handleToggleImagePrivate(img.tempId)
                            }
                          />
                          Imagen privada
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemovePendingImage(img.tempId)}
                          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aún no has agregado imágenes.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
              <h2 className="text-xl font-semibold">Video</h2>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Subir video
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

              {formData.video_url && embedVideoUrl && (
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

            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Crear propiedad</h2>
                  <p className="text-gray-600 text-sm">
                    Se guardará la propiedad base y luego se subirá la
                    multimedia automáticamente.
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
                  {saving ? "Creando..." : "Crear propiedad"}
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

export default PropertyCreate;