import { Link, useLocation, useNavigate } from "react-router-dom";
import logoBlanco from "../assets/yaxche-logoblanco.png";

function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const isLoginPage = location.pathname === "/login";

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      return null;
    }
  };

  const tokenData = token ? parseJwt(token) : null;
  console.log("TOKEN DATA:", tokenData);

  const isAdmin =
    tokenData?.is_superuser === true ||
    tokenData?.role === "admin" ||
    tokenData?.user_type === "admin";

  const isSeller =
    tokenData?.is_staff === true ||
    tokenData?.role === "seller" ||
    tokenData?.user_type === "seller";

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[#3D7754] border-t-4 border-[#CCA352] shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="shrink-0">
              <img
                src={logoBlanco}
                alt="Yaxché Desarrolladora Inmobiliaria"
                className="h-11 md:h-12 w-auto object-contain"
              />
            </Link>

            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition"
                title="Atrás"
              >
                ←
              </button>

              <button
                type="button"
                onClick={() => navigate(1)}
                className="w-10 h-10 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition"
                title="Adelante"
              >
                →
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {isAdmin && (
              <Link
                to="/properties/create"
                className="px-4 h-10 rounded-full bg-[#CCA352] text-white border border-[#CCA352] hover:brightness-95 transition flex items-center justify-center text-sm font-semibold"
                title="Crear nueva propiedad"
              >
                Nueva propiedad
              </Link>
            )}

            {(isAdmin || isSeller) && (
              <Link
                to="/settings"
                className="px-4 h-10 rounded-full bg-white text-[#3D7754] border border-white hover:bg-[#f7f1e3] transition flex items-center justify-center text-sm font-semibold"
                title="Configuración"
              >
                Settings
              </Link>
            )}

            {!token && !isLoginPage && (
              <Link
                to="/login"
                className="px-3 h-10 rounded-full border border-white/20 bg-white/5 text-white/90 hover:bg-white/10 transition flex items-center justify-center text-sm font-medium"
                title="Acceso interno"
              >
                Acceso interno
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;