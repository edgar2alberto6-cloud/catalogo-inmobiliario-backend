import React, { useState } from "react";

const formatPrice = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return "Precio no disponible";
  }

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(number);
};

const propertyTypeLabel = {
  house: "Casa",
  land: "Terreno",
  apartment: "Departamento",
  lots: "Lotes",
  hectares: "Hectáreas",
  ranch: "Rancho",
};

const listingTypeLabel = {
  sale: "Venta",
  rent: "Renta",
};

const statusLabel = {
  available: "Disponible",
  pending: "En proceso",
  sold: "Vendido",
};

const PropertyCard = ({ property = {}, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const safeProperty = property || {};
  const isLots = safeProperty.property_type === "lots";
  const isHectares = safeProperty.property_type === "hectares";

  const hasImage =
    Array.isArray(safeProperty.images) &&
    safeProperty.images.length > 0 &&
    safeProperty.images[0]?.image &&
    !imageError;

  const image = hasImage ? safeProperty.images[0].image : null;

  const title = safeProperty.title || "Propiedad disponible";

  const locationText =
    safeProperty.location && safeProperty.city
      ? `${safeProperty.location}, ${safeProperty.city}`
      : safeProperty.location || safeProperty.city || "Ubicación no disponible";

  const listingType =
    safeProperty.listing_type_display ||
    listingTypeLabel[safeProperty.listing_type] ||
    safeProperty.listing_type ||
    "Disponible";

  const status =
    safeProperty.status_display ||
    statusLabel[safeProperty.status] ||
    safeProperty.status ||
    "Disponible";

  const propertyType =
    safeProperty.property_type_display ||
    propertyTypeLabel[safeProperty.property_type] ||
    safeProperty.property_type ||
    "Propiedad";

  const statusClasses =
    safeProperty.status === "available"
      ? "bg-emerald-100 text-emerald-700"
      : safeProperty.status === "pending"
      ? "bg-amber-100 text-amber-700"
      : safeProperty.status === "sold"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  return (
    <article
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer border border-gray-100"
    >
      <div className="relative">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-56 object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-56 bg-[#f1f3ef] flex items-center justify-center">
            <div className="text-center px-4">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-[#3D7754]/10 flex items-center justify-center">
                <span className="text-[#3D7754] text-xl font-bold">Y</span>
              </div>
              <p className="text-sm font-semibold text-gray-600">
                Sin imagen disponible
              </p>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 flex gap-2 flex-wrap pr-3">
          <span className="px-3 py-1 rounded-full bg-white/90 text-[#3D7754] text-xs font-semibold shadow">
            {listingType}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow ${statusClasses}`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {title}
        </h2>

        <p className="text-sm text-gray-500 line-clamp-1">{locationText}</p>

        <p className="text-2xl font-bold text-[#3D7754]">
          {formatPrice(safeProperty.price)}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-1 gap-3">
          <span>{propertyType}</span>

          {safeProperty.credit_type &&
            safeProperty.credit_type !== "none" &&
            safeProperty.credit_type_display && (
              <span className="text-[#CCA352] font-medium text-right">
                {safeProperty.credit_type_display}
              </span>
            )}
        </div>

        {isLots && safeProperty.lot_price ? (
          <p className="text-sm text-gray-400">
            Precio por lote: {formatPrice(safeProperty.lot_price)}
          </p>
        ) : null}

        {isHectares && safeProperty.hectare_price ? (
          <p className="text-sm text-gray-400">
            Precio por hectárea: {formatPrice(safeProperty.hectare_price)}
          </p>
        ) : null}
      </div>
    </article>
  );
};

export default PropertyCard;