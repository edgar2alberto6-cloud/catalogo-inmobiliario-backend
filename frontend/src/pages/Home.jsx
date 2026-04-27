import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProperties } from "../api/properties";
import { getToken, parseJwt } from "../utils/auth";
import HomeHero from "../components/Home/HomeHero";
import HomeFilterBar from "../components/Home/HomeFilterBar";
import HomeInventoryCTA from "../components/Home/HomeInventoryCTA";
import PropertyGrid from "../components/properties/PropertyGrid";
import heroImage from "../assets/RENDER-6.jpg";

const PAGE_SIZE = 10;

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const inventoryRef = useRef(null);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState(false);

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

  const token = getToken();
  const tokenData = token ? parseJwt(token) : null;

  const role = tokenData?.is_superuser
    ? "admin"
    : tokenData?.is_staff
    ? "seller"
    : "public";

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionExpired = params.get("sessionExpired");

    if (sessionExpired === "1") {
      setSessionExpiredMessage(true);

      const timer = setTimeout(() => {
        setSessionExpiredMessage(false);
        navigate("/", { replace: true });
      }, 4500);

      return () => clearTimeout(timer);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    fetchProperties(currentPage);
  }, [currentPage, filters]);

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

  // 🔥 FETCH PRINCIPAL
  // Ahora manda página + filtros al backend.
  // Así el filtro ya no trabaja solo con la página actual.
  const fetchProperties = async (page = 1) => {
    try {
      setLoading(true);

      const res = await getProperties({
        page,
        ...filters,
      });

      const data = Array.isArray(res) ? res : res?.results || [];

      setProperties(sanitizeProperties(data));

      // Si el backend responde paginado: count, next, previous, results.
      // Si algún día responde arreglo normal, no se rompe.
      setNextUrl(Array.isArray(res) ? null : res?.next || null);
      setPrevUrl(Array.isArray(res) ? null : res?.previous || null);
      setCount(Array.isArray(res) ? data.length : res?.count || data.length);
    } catch (error) {
      console.error("Error:", error);
      setProperties([]);
      setNextUrl(null);
      setPrevUrl(null);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setCurrentPage(1);

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrev = () => {
    if (!prevUrl || currentPage <= 1) return;
    setCurrentPage((prev) => Math.max(1, prev - 1));
    scrollToInventory();
  };

  const handleNext = () => {
    if (!nextUrl || currentPage >= totalPages) return;
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
    scrollToInventory();
  };

  const handlePageClick = (page) => {
    if (page === currentPage) return;

    setCurrentPage(page);
    scrollToInventory();
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1];

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push("left-ellipsis");
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (end < totalPages - 1) {
      pages.push("right-ellipsis");
    }

    pages.push(totalPages);

    return pages;
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

  return (
    <div className="bg-[#f7f7f5] min-h-screen">
      {sessionExpiredMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md rounded-2xl border border-amber-200 bg-white px-5 py-4 shadow-xl">
          <p className="font-semibold text-gray-900">Tu sesión expiró</p>
          <p className="text-sm text-gray-600 mt-1">
            Por seguridad cerramos tu sesión. Puedes seguir viendo el catálogo
            público o iniciar sesión nuevamente.
          </p>
        </div>
      )}

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
            {loading ? "Cargando..." : `${count} propiedades encontradas`}
          </p>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="text-center py-10">Cargando...</div>
        ) : (
          <PropertyGrid properties={properties} onCardClick={handleCardClick} />
        )}

        {/* 🔥 PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
            <button
              onClick={handlePrev}
              disabled={!prevUrl || currentPage <= 1}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {getPageNumbers().map((page) => {
              if (typeof page === "string") {
                return (
                  <span
                    key={page}
                    className="px-2 py-2 text-sm text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              const isActive = page === currentPage;

              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  className={`min-w-10 px-3 py-2 rounded-lg border text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#3D7754] border-[#3D7754] text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={handleNext}
              disabled={!nextUrl || currentPage >= totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;