import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProperties } from "../api/properties";
import HomeHero from "../components/home/HomeHero";
import HomeFilterBar from "../components/home/HomeFilterBar";
import HomeInventoryCTA from "../components/home/HomeInventoryCTA";
import PropertyGrid from "../components/properties/PropertyGrid";

const CACHE_KEY = "cached_properties";

function Home() {
  const navigate = useNavigate();
  const inventoryRef = useRef(null);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingCache, setUsingCache] = useState(false);

  const [filters, setFilters] = useState({
    listing_type: "",
    property_type: "",
    credit_type: "",
    status: "",
    min_price: "",
    max_price: "",
    search: "",
  });

  const token = localStorage.getItem("token");

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  const tokenData = token ? parseJwt(token) : null;

  const role = tokenData?.is_superuser
    ? "admin"
    : tokenData?.is_staff
    ? "seller"
    : "public";

  useEffect(() => {
    fetchProperties();
  }, []);

  const sanitizeProperties = (list) => {
    if (!Array.isArray(list)) return [];

    return list.map((p, index) => ({
      id: p?.id ?? index,
      title: p?.title || "Propiedad disponible",
      city: p?.city || "",
      location: p?.location || "",
      price: p?.price || null,
      status: p?.status || "available",
      property_type: p?.property_type || "property",
      listing_type: p?.listing_type || "sale",
      credit_type: p?.credit_type || "none",
      credit_type_display: p?.credit_type_display || "",
      lot_price: p?.lot_price || null,
      images: Array.isArray(p?.images) ? p.images : [],
    }));
  };

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setUsingCache(false);

      const res = await getProperties();

      const safeData = sanitizeProperties(res?.results);

      setProperties(safeData);

      localStorage.setItem(CACHE_KEY, JSON.stringify(safeData));
    } catch (error) {
      console.error("Error:", error);

      const cached = localStorage.getItem(CACHE_KEY);

      if (cached) {
        console.warn("Usando cache local");
        setProperties(JSON.parse(cached));
        setUsingCache(true);
      } else {
        setProperties([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const scrollToInventory = () => {
    inventoryRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleCardClick = (property) => {
    if (role === "admin") {
      navigate(`/admin/property/${property.id}`);
      return;
    }

    if (role === "seller") {
      navigate(`/seller/property/${property.id}`);
      return;
    }

    navigate(`/property/${property.id}`);
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const searchText = filters.search.trim().toLowerCase();

      const matchesSearch =
        !searchText ||
        property.title?.toLowerCase().includes(searchText) ||
        property.city?.toLowerCase().includes(searchText) ||
        property.location?.toLowerCase().includes(searchText);

      const matchesListingType =
        !filters.listing_type ||
        property.listing_type === filters.listing_type;

      const matchesPropertyType =
        !filters.property_type ||
        property.property_type === filters.property_type;

      const matchesCreditType =
        !filters.credit_type ||
        property.credit_type === filters.credit_type;

      const matchesStatus =
        !filters.status || property.status === filters.status;

      const price = Number(property.price || 0);

      const matchesMinPrice =
        !filters.min_price || price >= Number(filters.min_price);

      const matchesMaxPrice =
        !filters.max_price || price <= Number(filters.max_price);

      return (
        matchesSearch &&
        matchesListingType &&
        matchesPropertyType &&
        matchesCreditType &&
        matchesStatus &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [properties, filters]);

  const heroImage = `${import.meta.env.VITE_API_URL.replace("/api", "")}/media/home_images/RENDER-6.jpg`;

  return (
    <div className="bg-[#f7f7f5] min-h-screen">
      <HomeHero backgroundImage={heroImage}>
        <HomeFilterBar
          filters={filters}
          onChange={handleFilterChange}
          onSearch={scrollToInventory}
        />
      </HomeHero>

      <HomeInventoryCTA onClick={scrollToInventory} />

      <section ref={inventoryRef} className="max-w-7xl mx-auto px-4 pb-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[#3D7754] font-semibold">
              Inventario disponible
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">
              Nuestras propiedades
            </h2>
          </div>

          <p className="text-gray-500">
            {loading
              ? "Cargando propiedades..."
              : `${filteredProperties.length} propiedades encontradas`}
          </p>
        </div>

        {usingCache && (
          <div className="mb-4 text-sm text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
            Mostrando datos guardados temporalmente. Puede haber cambios recientes no reflejados.
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-gray-500">
            Cargando propiedades...
          </div>
        ) : (
          <PropertyGrid
            properties={filteredProperties}
            onCardClick={handleCardClick}
          />
        )}
      </section>
    </div>
  );
}

export default Home;