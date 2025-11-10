import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/`,
  withCredentials: true,
});


// --- Interceptor to catch token expiration ---
api.interceptors.response.use(
  (res) => res, // if success, return normally
  async (err) => {
    const originalReq = err.config;

    console.log("Error")
    // If access token expired
    if (
      err.response &&
      err.response.status === 401 &&
      err.response.data?.expired &&
      !originalReq._retry
    ) {
      originalReq._retry = true;


      try {
        // Attempt to refresh token
        await api.post("/refresh-token");

        // Retry original request
        return api(originalReq);
      } catch (refreshErr) {
        console.log("Refresh token failed:", refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
