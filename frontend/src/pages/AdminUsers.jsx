import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import { getToken } from "../utils/auth";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [currentUsername, setCurrentUsername] = useState("");

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error("No se pudo leer el token:", error);
      return null;
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/users/");
      setUsers(response.data.results || []);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();

    if (token) {
      const decoded = parseJwt(token);
      setCurrentUsername(decoded?.username || "");
    }

    fetchUsers();
  }, []);

  const handleDelete = async (userId, username) => {
    if (username === currentUsername) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar al usuario "${username}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(userId);

      await axios.delete(`/users/${userId}/delete/`);

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error al eliminar usuario:", error);

      const message =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "No se pudo eliminar el usuario.";

      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p className="p-6">Cargando usuarios...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Administración de usuarios</h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Usuario</th>
              <th className="p-4">Correo</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.length > 0 ? (
              users.map((user) => {
                const isCurrentUser = user.username === currentUsername;

                return (
                  <tr key={user.id} className="border-t">
                    <td className="p-4">{user.id}</td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span>{user.username}</span>
                        {isCurrentUser && (
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                            Tú
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">{user.email || "Sin correo"}</td>
                    <td className="p-4">{user.role}</td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/settings/users/${user.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                        >
                          Ver detalle
                        </Link>

                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          disabled={deletingId === user.id || isCurrentUser}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition"
                          title={
                            isCurrentUser
                              ? "No puedes eliminar tu propia cuenta"
                              : "Eliminar usuario"
                          }
                        >
                          {deletingId === user.id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;