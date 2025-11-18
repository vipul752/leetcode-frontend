import axios from "axios";

const axiosClient = axios.create({
  // baseURL: "https://leetcode-2-ukra.onrender.com",
  baseURL: "http://13.204.226.6:3000/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
