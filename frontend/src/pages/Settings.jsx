import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    navigate("/");
  };

  const token = localStorage.getItem("token");

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      return null;
    }
  };

  const tokenData = token ? parseJwt(token) : null;
  const isAdmin = tokenData?.is_superuser === true;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.2em] text-[#3D7754] font-semibold mb-2">
          Configuración
        </p>

        <h1 className="text-3xl font-bold text-gray-900">Panel de ajustes</h1>
        <p className="text-gray-600 mt-2">
          Administra las opciones principales del sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isAdmin && (
          <button
            type="button"
            onClick={() => navigate("/settings/users")}
            className="text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-[#3D7754]/30 transition"
          >
            <p className="text-sm uppercase tracking-[0.15em] text-[#3D7754] font-semibold mb-2">
              Usuarios
            </p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Gestión de usuarios
            </h2>
            <p className="text-gray-600">
              Ver, editar y administrar cuentas internas del sistema.
            </p>
          </button>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm uppercase tracking-[0.15em] text-[#3D7754] font-semibold mb-2">
            Sistema
          </p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Configuración general
          </h2>
          <p className="text-gray-600">
            Aquí puedes centralizar otros ajustes administrativos del catálogo.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 h-10 rounded-full bg-white text-red-600 border border-red-200 hover:bg-red-50 transition flex items-center justify-center text-sm font-semibold"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default Settings;