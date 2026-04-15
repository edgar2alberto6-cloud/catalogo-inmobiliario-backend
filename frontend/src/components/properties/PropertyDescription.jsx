function PropertyDescription({ description }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold mb-3">Descripción</h2>
      <p className="text-gray-700 whitespace-pre-line">
        {description || "Sin descripción"}
      </p>
    </div>
  );
}

export default PropertyDescription;