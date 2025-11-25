import axios from "axios";

export const createPost = (text) =>
  axiosClient.post("/social/create", { text });

export const getFeed = () => axiosClient.get("/social/feed");

export const likePost = (postId) => axiosClient.post(`/social/like/${postId}`);

export const unlikePost = (postId) =>
  axiosClient.post(`/social/unlike/${postId}`);

export const commentOnPost = (postId, comment) =>
  axiosClient.post(`/social/comment/${postId}`, { comment });

export const followUser = (userId) =>
  axiosClient.post(`/social/follow/${userId}`);

export const unfollowUser = (userId) =>
  axiosClient.post(`/social/unfollow/${userId}`);

const axiosClient = axios.create({
  // baseURL: "https://api.codearena.digital",
  // baseURL: "http://localhost:3000" ,

  baseURL:
    import.meta.env.MODE === "production"
      ? "https://codearena-qoaq.onrender.com"
      : // "https://api.codearena.digital"
        "http://localhost:3000",
  withCredentials: true,
  timeout: 10000, // 10 second timeout for all requests
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
