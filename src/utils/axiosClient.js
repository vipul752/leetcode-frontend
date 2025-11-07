import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://leetcode-2-ukra.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
