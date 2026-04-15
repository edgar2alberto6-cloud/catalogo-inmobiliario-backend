import { Navigate } from "react-router-dom";

function SellerRoute({ children }) {
  const token = localStorage.getItem("token");

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      return null;
    }
  };

  const tokenData = token ? parseJwt(token) : null;

  const isSeller =
    tokenData?.is_staff === true || tokenData?.is_superuser === true;

  if (!isSeller) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default SellerRoute;