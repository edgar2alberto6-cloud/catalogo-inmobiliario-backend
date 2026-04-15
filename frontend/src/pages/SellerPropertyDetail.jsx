import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { getPropertyDetail } from "../api/properties";
import ErrorBoundary from "../components/ErrorBoundary";
import PropertyGallery from "../components/properties/PropertyGallery";
import PropertyVideo from "../components/properties/PropertyVideo";
import PropertyFeatures from "../components/properties/PropertyFeatures";
import PropertyHeader from "../components/properties/PropertyHeader";
import PropertyDescription from "../components/properties/PropertyDescription";
import PropertySidebar from "../components/properties/PropertySidebar";

function SellerPropertyDetail() {
  const { id } = useParams();

  const [property, setProperty] = useState(null);
  const [whatsapp, setWhatsapp] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [propertyError, setPropertyError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setPropertyError(false);

      try {
        const propertyData = await getPropertyDetail(id);
        console.log("SELLER PROPERTY:", propertyData);

        const safeProperty = {
          id: propertyData?.id ?? id,
          title: propertyData?.title || "Propiedad disponible",
          location: propertyData?.location || "",
          city: propertyData?.city || "",
          description:
            propertyData?.description || "Información no disponible por el momento.",
          price: propertyData?.price || null,
          lot_price: propertyData?.lot_price || null,
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
          google_maps_link: propertyData?.google_maps_link || "",
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

  const handleStatusChange = async (newStatus) => {
    const statusLabel =
      newStatus === "available"
        ? "Disponible"
        : newStatus === "pending"
        ? "En proceso"
        : "Vendido";

    const confirmed = window.confirm(
      `¿Deseas cambiar el estado de esta propiedad a "${statusLabel}"?`
    );

    if (!confirmed) return;

    try {
      setUpdatingStatus(true);

      await axios.patch(`/properties/${id}/status/`, {
        status: newStatus,
      });

      setProperty((prev) => ({
        ...prev,
        status: newStatus,
        status_display: statusLabel,
      }));
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("No se pudo actualizar el estado.");
    } finally {
      setUpdatingStatus(false);
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

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4">
        <ErrorBoundary>
          <PropertyHeader
            title={property.title}
            location={property.location}
            city={property.city}
            showEditButton={false}
          />
        </ErrorBoundary>

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

            <ErrorBoundary>
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <p className="text-sm uppercase tracking-[0.18em] text-[#3D7754] font-semibold mb-2">
                  Vista vendedor
                </p>

                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Panel de vendedor
                </h2>

                <p className="text-gray-600 mb-5">
                  Aquí el vendedor puede cambiar el estado de la propiedad sin
                  entrar a edición completa.
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatusChange("available")}
                    disabled={updatingStatus}
                    className={`px-4 h-11 rounded-full border transition text-sm font-semibold ${
                      property.status === "available"
                        ? "bg-[#3D7754] text-white border-[#3D7754]"
                        : "bg-white text-[#3D7754] border-[#3D7754] hover:bg-[#3D7754] hover:text-white"
                    }`}
                  >
                    Disponible
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange("pending")}
                    disabled={updatingStatus}
                    className={`px-4 h-11 rounded-full border transition text-sm font-semibold ${
                      property.status === "pending"
                        ? "bg-[#CCA352] text-white border-[#CCA352]"
                        : "bg-white text-[#CCA352] border-[#CCA352] hover:bg-[#CCA352] hover:text-white"
                    }`}
                  >
                    En proceso
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange("sold")}
                    disabled={updatingStatus}
                    className={`px-4 h-11 rounded-full border transition text-sm font-semibold ${
                      property.status === "sold"
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-white text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                    }`}
                  >
                    Vendido
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  Estado actual:{" "}
                  <span className="font-semibold">
                    {property.status_display || property.status}
                  </span>
                </p>
              </div>
            </ErrorBoundary>
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

export default SellerPropertyDetail;