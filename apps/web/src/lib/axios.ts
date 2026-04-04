import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default axiosInstance;
