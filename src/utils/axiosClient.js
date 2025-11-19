import axios from "axios";

const axiosClient = axios.create({
  // baseURL: "https://api.codearena.digital",
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
