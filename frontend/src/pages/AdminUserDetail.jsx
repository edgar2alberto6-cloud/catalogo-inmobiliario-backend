import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";

function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/users/${id}/`);
      setUser(response.data);
    } catch (error) {
      console.error("Error al cargar detalle del usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "Sin registro";
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return <p className="p-6">Cargando usuario...</p>;
  }

  if (!user) {
    return <p className="p-6">No se encontró el usuario.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Detalle del usuario</h1>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/settings/users")}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
          >
            Volver
          </button>

          <button
            onClick={() => navigate(`/settings/users/${id}/edit`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Editar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Información básica</h2>

          <div className="space-y-2">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Nombre:</strong> {user.first_name || "Sin nombre"}</p>
            <p><strong>Apellidos:</strong> {user.last_name || "Sin apellidos"}</p>
            <p><strong>Correo:</strong> {user.email || "Sin correo"}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Estado y rol</h2>

          <div className="space-y-2">
            <p><strong>Rol:</strong> {user.role}</p>
            <p><strong>Activo:</strong> {user.is_active ? "Sí" : "No"}</p>
            <p><strong>Staff:</strong> {user.is_staff ? "Sí" : "No"}</p>
            <p><strong>Admin:</strong> {user.is_superuser ? "Sí" : "No"}</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Fechas</h2>

          <div className="space-y-2">
            <p><strong>Último login:</strong> {formatDate(user.last_login)}</p>
            <p><strong>Fecha de creación:</strong> {formatDate(user.date_joined)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUserDetail;