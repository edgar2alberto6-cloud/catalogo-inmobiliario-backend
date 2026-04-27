import { Navigate } from "react-router-dom";
import { getToken, parseJwt, logout } from "../utils/auth";

function AdminRoute({ children }) {
  const token = getToken();
  const tokenData = parseJwt(token);

  const isExpired = tokenData?.exp
    ? tokenData.exp * 1000 < Date.now()
    : true;

  const isAdmin = tokenData?.is_superuser === true;

  if (!token || isExpired || !isAdmin) {
    logout();
    return <Navigate to="/?sessionExpired=1" replace />;
  }

  return children;
}

export default AdminRoute;