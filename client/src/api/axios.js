import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// ─── Request interceptor — đính kèm access token ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Các path public không cần redirect về login khi 401
const PUBLIC_PATHS = ["/", "/browse-apartments", "/favorite-apartments"];
const isPublicPath = () => {
  const path = window.location.pathname;
  return (
    PUBLIC_PATHS.includes(path) ||
    path.startsWith("/apartments/") ||
    path.startsWith("/chinh-sach") ||
    path.startsWith("/dieu-khoan") ||
    path.startsWith("/quy-dinh") ||
    path.startsWith("/bang-gia")
  );
};

// ─── Response interceptor — tự động refresh khi 401 ─────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Bỏ qua nếu đang ở trang public
    if (isPublicPath()) {
      return Promise.reject(error);
    }

    // Chỉ xử lý 401, không retry nếu đã retry hoặc là request auth
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data?.data?.accessToken;
        if (!newToken) throw new Error("No token in refresh response");

        localStorage.setItem("token", newToken);

        if (res.data?.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.data.user));
        }

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // Chỉ redirect nếu đang ở trang cần auth (không phải background request)
        if (!isPublicPath()) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
