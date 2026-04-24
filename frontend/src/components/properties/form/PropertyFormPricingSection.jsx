function PropertyFormPricingSection({ formData, onChange }) {
  const isLots = formData.property_type === "lots";
  const isHectares = formData.property_type === "hectares";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Precios y medidas</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Precio</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Medidas</label>
          <input
            type="text"
            name="measures"
            value={formData.measures}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        {isLots && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Total de lotes
              </label>
              <input
                type="number"
                name="total_lots"
                value={formData.total_lots}
                onChange={onChange}
                className="w-full border rounded-xl px-4 py-2"
                placeholder="Ej. 20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Precio por lote
              </label>
              <input
                type="number"
                name="lot_price"
                value={formData.lot_price}
                onChange={onChange}
                className="w-full border rounded-xl px-4 py-2"
                placeholder="Ej. 750000"
              />
            </div>
          </>
        )}

        {isHectares && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Total de hectáreas
              </label>
              <input
                type="number"
                step="0.01"
                name="total_hectares"
                value={formData.total_hectares}
                onChange={onChange}
                className="w-full border rounded-xl px-4 py-2"
                placeholder="Ej. 3.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Precio por hectárea
              </label>
              <input
                type="number"
                name="hectare_price"
                value={formData.hectare_price}
                onChange={onChange}
                className="w-full border rounded-xl px-4 py-2"
                placeholder="Ej. 45000"
              />
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Especificaciones
          </label>
          <textarea
            name="specifications"
            value={formData.specifications}
            onChange={onChange}
            rows="4"
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>
      </div>
    </div>
  );
}

export default PropertyFormPricingSection;