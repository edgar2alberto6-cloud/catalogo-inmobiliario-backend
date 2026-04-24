import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProperties } from "../api/properties";
import HomeHero from "../components/Home/HomeHero";
import HomeFilterBar from "../components/Home/HomeFilterBar";
import HomeInventoryCTA from "../components/Home/HomeInventoryCTA";
import PropertyGrid from "../components/properties/PropertyGrid";
import heroImage from "../assets/RENDER-6.jpg";

function Home() {
  const navigate = useNavigate();
  const inventoryRef = useRef(null);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 PAGINACIÓN
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

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
      images: Array.isArray(p?.images) ? p.images : [],
    }));
  };

  // 🔥 FETCH PRINCIPAL (con soporte URL dinámica)
  const fetchProperties = async (url = null) => {
    try {
      setLoading(true);

      let res;

      if (url) {
        res = await fetch(url).then((r) => r.json());
      } else {
        res = await getProperties();
      }

      const data = Array.isArray(res) ? res : res?.results || [];

      setProperties(sanitizeProperties(data));

      // 🔥 PAGINACIÓN
      setNextUrl(res?.next);
      setPrevUrl(res?.previous);
      setCount(res?.count || data.length);

      // detectar página actual
      if (url) {
        const match = url.match(/page=(\d+)/);
        if (match) setCurrentPage(Number(match[1]));
      } else {
        setCurrentPage(1);
      }

    } catch (error) {
      console.error("Error:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (nextUrl) fetchProperties(nextUrl);
  };

  const handlePrev = () => {
    if (prevUrl) fetchProperties(prevUrl);
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

        {/* HEADER */}
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
              ? "Cargando..."
              : `${count} propiedades totales`}
          </p>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="text-center py-10">Cargando...</div>
        ) : (
          <PropertyGrid
            properties={filteredProperties}
            onCardClick={handleCardClick}
          />
        )}

        {/* 🔥 PAGINACIÓN */}
        <div className="flex justify-center items-center gap-4 mt-8">

          <button
            onClick={handlePrev}
            disabled={!prevUrl}
            className="px-4 py-2 rounded-lg border disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {currentPage}
          </span>

          <button
            onClick={handleNext}
            disabled={!nextUrl}
            className="px-4 py-2 rounded-lg border disabled:opacity-40"
          >
            Siguiente
          </button>

        </div>

      </section>
    </div>
  );
}

export default Home;

// trigger redeploy
// trigger redeploy// trigger redeploy
// trigger redeploy