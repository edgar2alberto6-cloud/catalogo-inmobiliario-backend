function PropertyFormClassificationSection({ formData, onChange }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Clasificación</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2 bg-white"
          >
            <option value="available">Disponible</option>
            <option value="pending">En proceso</option>
            <option value="sold">Vendido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo de propiedad
          </label>
          <select
            name="property_type"
            value={formData.property_type}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2 bg-white"
          >
            <option value="house">Casa</option>
            <option value="land">Terreno</option>
            <option value="apartment">Departamento</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo de publicación
          </label>
          <select
            name="listing_type"
            value={formData.listing_type}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2 bg-white"
          >
            <option value="sale">Venta</option>
            <option value="rent">Renta</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tipo de crédito
          </label>
          <select
            name="credit_type"
            value={formData.credit_type}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2 bg-white"
          >
            <option value="none">Ninguno</option>
            <option value="infonavit">INFONAVIT</option>
            <option value="fovissste">FOVISSSTE</option>
            <option value="both">INFONAVIT y FOVISSSTE</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default PropertyFormClassificationSection;