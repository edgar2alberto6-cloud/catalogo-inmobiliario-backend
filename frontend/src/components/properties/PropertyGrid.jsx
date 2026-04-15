import PropertyCard from "./PropertyCard";

function PropertyGrid({ properties = [], onCardClick }) {
  if (!properties.length) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
        No se encontraron propiedades con esos filtros.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onClick={() => onCardClick?.(property)}
        />
      ))}
    </div>
  );
}

export default PropertyGrid;