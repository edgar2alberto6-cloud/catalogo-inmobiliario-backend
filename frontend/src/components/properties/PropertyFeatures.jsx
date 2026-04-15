function PropertyFeatures({ property }) {
  if (!property) return null;

  const safeProperty = property || {};

  const features = [
    safeProperty.property_type_display
      ? { icon: "🏠", label: "Tipo", value: safeProperty.property_type_display }
      : null,
    safeProperty.listing_type_display
      ? { icon: "📌", label: "Operación", value: safeProperty.listing_type_display }
      : null,
    safeProperty.status_display
      ? { icon: "📊", label: "Estado", value: safeProperty.status_display }
      : null,
    safeProperty.credit_type_display
      ? { icon: "🏦", label: "Crédito", value: safeProperty.credit_type_display }
      : null,
    safeProperty.measures
      ? { icon: "📏", label: "Medidas", value: safeProperty.measures }
      : null,
    safeProperty.total_lots
      ? { icon: "🧱", label: "Lotes", value: `${safeProperty.total_lots} lotes` }
      : null,
  ].filter(Boolean);

  const specifications =
    typeof safeProperty.specifications === "string"
      ? safeProperty.specifications.trim()
      : "";

  const hasMainFeatures = features.length > 0;
  const hasSpecifications = !!specifications;

  if (!hasMainFeatures && !hasSpecifications) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Características
      </h2>

      {hasMainFeatures && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <div
              key={`${feature.label}-${index}`}
              className="rounded-xl border border-gray-100 bg-[#f8faf8] px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-[#3D7754] font-semibold mb-1">
                {feature.icon} {feature.label}
              </p>
              <p className="text-gray-800 font-medium">{feature.value}</p>
            </div>
          ))}
        </div>
      )}

      {hasSpecifications && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            Especificaciones
          </h3>
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {specifications}
          </p>
        </div>
      )}
    </div>
  );
}

export default PropertyFeatures;