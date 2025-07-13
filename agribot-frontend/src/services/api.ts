import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});


// Add Authorization token for requests (if needed)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Get token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
