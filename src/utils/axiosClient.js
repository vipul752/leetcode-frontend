import axios from "axios";

const axiosClient = axios.create({
  // baseURL: "https://api.codearena.digital",
  // baseURL: "http://localhost:3000" ,

  baseURL:
    import.meta.env.MODE === "production"
      ? "https://codearena-qoaq.onrender.com"
      : // ? "https://api.codearena.digital"
        "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
