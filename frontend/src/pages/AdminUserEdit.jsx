import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";

function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    is_active: true,
    is_staff: false,
    is_superuser: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/users/${id}/`);
      const user = response.data;

      setForm({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        is_active: user.is_active,
        is_staff: user.is_staff,
        is_superuser: user.is_superuser,
      });
    } catch (error) {
      console.error("Error al cargar usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await axios.patch(`/users/${id}/update/`, form);

      alert("Usuario actualizado correctamente.");
      navigate(`/settings/users/${id}`);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);

      const message =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "No se pudo actualizar el usuario.";

      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-6">Cargando usuario...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Editar usuario</h1>

        <button
          onClick={() => navigate(`/settings/users/${id}`)}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
        >
          Cancelar
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nombre</label>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Apellidos</label>
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Correo</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            <span>Usuario activo</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_staff"
              checked={form.is_staff}
              onChange={handleChange}
            />
            <span>Staff / Vendedor</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_superuser"
              checked={form.is_superuser}
              onChange={handleChange}
            />
            <span>Administrador</span>
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminUserEdit;