export const saveToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
};

export const parseJwt = (token) => {
  try {
    if (!token) return null;

    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error al leer token:", error);
    return null;
  }
};

export const getUserRole = () => {
  const token = getToken();
  const payload = parseJwt(token);

  if (!payload) return "public";
  if (payload.is_superuser) return "admin";
  if (payload.is_staff) return "seller";

  return "public";
};