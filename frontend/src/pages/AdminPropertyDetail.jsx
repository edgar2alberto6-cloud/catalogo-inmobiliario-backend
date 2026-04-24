import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { getPropertyDetail, deleteProperty } from "../api/properties";
import ErrorBoundary from "../components/ErrorBoundary";
import PropertyGallery from "../components/properties/PropertyGallery";
import PropertyVideo from "../components/properties/PropertyVideo";
import PropertyFeatures from "../components/properties/PropertyFeatures";
import PropertyHeader from "../components/properties/PropertyHeader";
import PropertyDescription from "../components/properties/PropertyDescription";
import PropertySidebar from "../components/properties/PropertySidebar";
import PropertyAdminSection from "../components/properties/PropertyAdminSection";

function AdminPropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [whatsapp, setWhatsapp] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [propertyError, setPropertyError] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setPropertyError(false);

      try {
        const propertyData = await getPropertyDetail(id);

        const safeProperty = {
          id: propertyData?.id ?? id,
          title: propertyData?.title || "Propiedad disponible",
          location: propertyData?.location || "",
          city: propertyData?.city || "",
          description:
            propertyData?.description || "Información no disponible por el momento.",
          price: propertyData?.price || null,
          lot_price: propertyData?.lot_price || null,
          hectare_price: propertyData?.hectare_price || null,
          property_type: propertyData?.property_type || "property",
          property_type_display:
            propertyData?.property_type_display || "Propiedad",
          listing_type: propertyData?.listing_type || "sale",
          listing_type_display:
            propertyData?.listing_type_display || "Venta",
          status: propertyData?.status || "available",
          status_display:
            propertyData?.status_display || "Disponible",
          credit_type: propertyData?.credit_type || "none",
          credit_type_display: propertyData?.credit_type_display || "",
          images: Array.isArray(propertyData?.images) ? propertyData.images : [],
          video: propertyData?.video || null,
          video_url: propertyData?.video_url || null,
          measures: propertyData?.measures || "",
          specifications: propertyData?.specifications || "",
          total_lots: propertyData?.total_lots || null,
          total_hectares: propertyData?.total_hectares || null,
          google_maps_link: propertyData?.google_maps_link || "",
          owner_name: propertyData?.owner_name || "",
          owner_phone: propertyData?.owner_phone || "",
          internal_notes: propertyData?.internal_notes || "",
          payment_details: propertyData?.payment_details || "",
          folio: propertyData?.folio || "",
        };

        setProperty(safeProperty);
      } catch (error) {
        console.error("Error al cargar propiedad:", error);
        setPropertyError(true);
        setProperty(null);
      }

      try {
        const res = await axios.get("/settings/");
        const settingsData = Array.isArray(res.data)
          ? res.data
          : res.data.results || [];

        if (settingsData.length > 0) {
          setWhatsapp(settingsData[0]?.whatsapp_number || null);
        } else {
          setWhatsapp(null);
        }
      } catch (error) {
        console.error("Error al cargar settings:", error);
        setWhatsapp(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDeleteProperty = async () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar esta propiedad?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteProperty(id);
      alert("La propiedad se eliminó correctamente.");
      navigate("/");
    } catch (error) {
      console.error("Error al eliminar propiedad:", error);

      const backendMessage =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "No se pudo eliminar la propiedad.";

      alert(backendMessage);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
            Cargando propiedad...
          </div>
        </div>
      </div>
    );
  }

  if (propertyError || !property) {
    return (
      <div className="bg-gray-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-red-100">
            <p className="text-sm uppercase tracking-[0.18em] text-red-500 font-semibold mb-2">
              Error de carga
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              No se pudo mostrar esta propiedad
            </h2>
            <p className="text-gray-600">
              Intenta recargar la página o volver al catálogo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const images = Array.isArray(property.images) ? property.images : [];

  const canSeeAdminData =
    !!token &&
    [
      "owner_name",
      "owner_phone",
      "internal_notes",
      "payment_details",
      "google_maps_link",
      "folio",
    ].some((field) => property[field] !== undefined && property[field] !== null);

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <ErrorBoundary>
          <PropertyHeader
            title={property.title}
            location={property.location}
            city={property.city}
            showEditButton={canSeeAdminData}
            editPath={`/admin/property/${id}/edit`}
          />
        </ErrorBoundary>

        {canSeeAdminData && (
          <div className="mt-4 mb-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/admin/property/${id}/edit`)}
              className="px-4 h-11 rounded-full bg-[#3D7754] text-white hover:brightness-95 transition font-semibold"
            >
              Editar propiedad
            </button>

            <button
              onClick={handleDeleteProperty}
              disabled={deleting}
              className="px-4 h-11 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition font-semibold"
            >
              {deleting ? "Eliminando..." : "Eliminar propiedad"}
            </button>
          </div>
        )}

        <ErrorBoundary>
          <PropertyGallery images={images} />
        </ErrorBoundary>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <ErrorBoundary>
              <PropertyDescription description={property.description} />
            </ErrorBoundary>

            <ErrorBoundary>
              <PropertyFeatures property={property} />
            </ErrorBoundary>

            <ErrorBoundary>
              <PropertyVideo
                video={property.video}
                videoUrl={property.video_url}
              />
            </ErrorBoundary>

            {canSeeAdminData && (
              <ErrorBoundary>
                <PropertyAdminSection property={property} />
              </ErrorBoundary>
            )}
          </div>

          <div>
            <ErrorBoundary>
              <PropertySidebar property={property} whatsapp={whatsapp} />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPropertyDetail;