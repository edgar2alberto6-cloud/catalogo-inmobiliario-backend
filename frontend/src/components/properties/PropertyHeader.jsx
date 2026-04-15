import { Link } from "react-router-dom";

function PropertyHeader({
  title,
  location,
  city,
  showEditButton = false,
  editPath = "",
}) {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>

      <p className="text-gray-500 mt-1">
        📍 {location} · {city}
      </p>

      {showEditButton && editPath && (
        <div className="mt-4">
          <Link
            to={editPath}
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            ✏️ Editar propiedad
          </Link>
        </div>
      )}
    </div>
  );
}

export default PropertyHeader;