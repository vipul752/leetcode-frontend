import axios from "axios";

const axiosClient = axios.create({
  // baseURL: "https://leetcode-2-ukra.onrender.com",
  baseURL: "https://api.codearena.digital",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
