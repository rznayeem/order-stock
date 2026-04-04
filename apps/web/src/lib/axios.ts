import axios from "axios";

// Using an environment variable for the API URL is a senior-level practice.
// This allows the app to work seamlessly in both Local Dev and Production (Vercel).
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default axiosInstance;
