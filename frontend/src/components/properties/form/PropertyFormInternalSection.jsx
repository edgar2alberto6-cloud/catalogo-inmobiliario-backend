function PropertyFormInternalSection({ formData, onChange }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Información interna</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Folio</label>
          <input
            type="text"
            name="folio"
            value={formData.folio}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Nombre del dueño
          </label>
          <input
            type="text"
            name="owner_name"
            value={formData.owner_name}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Teléfono del dueño
          </label>
          <input
            type="text"
            name="owner_phone"
            value={formData.owner_phone}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Link de Google Maps
          </label>
          <input
            type="text"
            name="google_maps_link"
            value={formData.google_maps_link}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Detalles de pago
          </label>
          <textarea
            name="payment_details"
            value={formData.payment_details}
            onChange={onChange}
            rows="4"
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Notas internas
          </label>
          <textarea
            name="internal_notes"
            value={formData.internal_notes}
            onChange={onChange}
            rows="4"
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>
      </div>
    </div>
  );
}

export default PropertyFormInternalSection;