import axios from "./axios";

// 🧹 limpiar parámetros antes de enviarlos al backend
const cleanQueryParams = (params = {}) => {
  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => {
        if (typeof value === "string") {
          return [key, value.trim()];
        }

        return [key, value];
      })
      .filter(([, value]) => value !== "" && value !== null && value !== undefined)
  );
};

// 🔥 obtener propiedades
// Acepta filtros y paginación desde el backend.
// Ejemplos:
// getProperties()
// getProperties({ page: 2 })
// getProperties({ search: "casa", property_type: "house", listing_type: "sale" })
// getProperties({ search: "hectarea" })
// getProperties({ search: "Xocen" })
export const getProperties = async (params = {}) => {
  const cleanParams = cleanQueryParams(params);

  const response = await axios.get("/properties/", {
    params: cleanParams,
  });

  return response.data;
};

// 🔥 obtener detalle de una propiedad
export const getPropertyDetail = async (id) => {
  const response = await axios.get(`/properties/${id}/`);
  return response.data;
};

// ⚙️ obtener settings
export const getSettings = async () => {
  const response = await axios.get("/settings/");
  return response.data;
};

// ✏️ actualizar propiedad completa
// Sirve tanto para JSON normal como para FormData, por ejemplo video.
export const updateProperty = async (id, data) => {
  const config =
    data instanceof FormData
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : {};

  const response = await axios.patch(`/properties/${id}/update/`, data, config);
  return response.data;
};

// 🗑 eliminar propiedad
export const deleteProperty = async (id) => {
  const response = await axios.delete(`/properties/${id}/delete/`);
  return response.data;
};

// 🎥 quitar video archivo
export const removePropertyVideo = async (id) => {
  const response = await axios.patch(`/properties/${id}/remove-video/`);
  return response.data;
};

// 🔗 quitar video_url
export const removePropertyVideoUrl = async (id) => {
  const response = await axios.patch(`/properties/${id}/remove-video-url/`);
  return response.data;
};

// 🔥 subir una imagen a una propiedad
export const uploadPropertyImage = async (propertyId, formData) => {
  const response = await axios.post(
    `/properties/${propertyId}/upload-image/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// 🗑 eliminar una imagen
export const deletePropertyImage = async (imageId) => {
  const response = await axios.delete(`/property-images/${imageId}/delete/`);
  return response.data;
};

// 🔥 crear propiedad
// Funciona con JSON normal y también con FormData si después se usa para archivos.
export const createProperty = async (data) => {
  const config =
    data instanceof FormData
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : {};

  const response = await axios.post("/properties/", data, config);
  return response.data;
};