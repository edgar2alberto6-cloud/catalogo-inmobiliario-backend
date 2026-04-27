import { Navigate } from "react-router-dom";
import { getToken, parseJwt, logout } from "../utils/auth";

function SellerRoute({ children }) {
  const token = getToken();
  const tokenData = parseJwt(token);

  const isExpired = tokenData?.exp
    ? tokenData.exp * 1000 < Date.now()
    : true;

  const isSeller =
    tokenData?.is_staff === true || tokenData?.is_superuser === true;

  if (!token || isExpired || !isSeller) {
    logout();
    return <Navigate to="/" replace state={{ sessionExpired: isExpired }} />;
  }

  return children;
}

export default SellerRoute;