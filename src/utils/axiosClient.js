import axios from "axios";

const axiosClient = axios.create({
  // baseURL: "https://leetcode-2-ukra.onrender.com",

  // baseURL: "https://api.codearena.digital",
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
