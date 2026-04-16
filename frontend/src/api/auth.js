import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const login = async (username, password) => {
  const response = await axios.post(`${API}/login/`, {
    username,
    password,
  });

  return response.data;
};