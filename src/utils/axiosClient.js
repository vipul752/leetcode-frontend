import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://leetcode-1-ggx4.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
