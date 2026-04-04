import axios from "axios";

/**
 * - If `NEXT_PUBLIC_API_URL` is set to a full URL, the browser calls the API host directly (local dev; cross-site cookies will not work on Vercel).
 * - If unset, requests go to same-origin `/api/v1`, which Next proxies to Express using `API_PROXY_TARGET` (required in production for session cookies).
 */
const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
const useSameOriginProxy = !explicit || explicit === "same-origin";

const baseURL = useSameOriginProxy
  ? "/api/v1"
  : `${explicit!.replace(/\/$/, "")}/api/v1`;

const axiosInstance = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default axiosInstance;
