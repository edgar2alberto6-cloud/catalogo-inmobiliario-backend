function PropertyAdminSection({ property }) {
  if (!property) return null;

  const hasAdminData =
    property.owner_name !== undefined ||
    property.owner_phone !== undefined ||
    property.internal_notes !== undefined ||
    property.payment_details !== undefined ||
    property.google_maps_link !== undefined ||
    property.folio !== undefined;

  if (!hasAdminData) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold mb-3">Datos del propietario</h2>
      <p>Nombre: {property.owner_name || "Sin nombre"}</p>
      <p>Teléfono: {property.owner_phone || "Sin teléfono"}</p>

      {property.folio && (
        <>
          <h2 className="text-xl font-semibold mt-4 mb-3">Folio</h2>
          <p>{property.folio}</p>
        </>
      )}

      <h2 className="text-xl font-semibold mt-4 mb-3">Notas internas</h2>
      <p>{property.internal_notes || "Sin notas"}</p>

      {property.payment_details && (
        <>
          <h2 className="text-xl font-semibold mt-4 mb-3">
            Detalles de pago
          </h2>
          <p className="whitespace-pre-line">{property.payment_details}</p>
        </>
      )}

      {property.google_maps_link && (
        <>
          <h2 className="text-xl font-semibold mt-4 mb-3">Ubicación</h2>
          <a
            href={property.google_maps_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Ver mapa
          </a>
        </>
      )}
    </div>
  );
}

export default PropertyAdminSection;