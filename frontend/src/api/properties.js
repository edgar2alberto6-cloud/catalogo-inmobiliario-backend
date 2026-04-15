import axios from "./axios";

// 🔥 obtener propiedades
export const getProperties = async () => {
  const response = await axios.get("/properties/");
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
// sirve tanto para JSON normal como para FormData (por ejemplo video)
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

export const createProperty = async (data) => {
  const response = await axios.post("/properties/", data);
  return response.data;
};