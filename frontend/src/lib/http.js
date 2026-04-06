// "use client";

// import axios from "axios";

// // Base URL from environment variable
// const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// // Create axios instance with defaults
// const http = axios.create({
//   baseURL: API,
//   withCredentials: true,
//   headers: { "Content-Type": "application/json" },
// });

// // Flag to prevent infinite refresh loops
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve();
//     }
//   });
//   failedQueue = [];
// };

// // Response interceptor — handles 401 by trying to refresh the token
// http.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // If 401 and not already retrying and not the refresh endpoint itself
//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url?.includes("/auth/refresh") &&
//       !originalRequest.url?.includes("/auth/login")
//     ) {
//       if (isRefreshing) {
//         // Queue this request until refresh completes
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(() => http(originalRequest));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       try {
//         // Try to get a new access token using the refresh token
//         await axios.post(`${API}/auth/refresh`, {}, { withCredentials: true });
//         processQueue(null);
//         // Retry the original request
//         return http(originalRequest);
//       } catch (refreshError) {
//         processQueue(refreshError);
//         // Refresh failed — redirect to login
//         if (typeof window !== "undefined") {
//           window.location.href = "/login";
//         }
//         return Promise.reject(refreshError);
//       } finally {
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default http;
"use client";

import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const http = axios.create({
  baseURL: API,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        await axios.post(`${API}/auth/refresh`, {}, { withCredentials: true });
        return http(originalRequest);
      } catch {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default http;