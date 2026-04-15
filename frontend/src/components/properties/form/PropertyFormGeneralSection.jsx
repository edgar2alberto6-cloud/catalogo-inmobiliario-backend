function PropertyFormGeneralSection({ formData, onChange }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Información general</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ciudad</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Ubicación
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={onChange}
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            rows="5"
            className="w-full border rounded-xl px-4 py-2"
          />
        </div>
      </div>
    </div>
  );
}

export default PropertyFormGeneralSection;