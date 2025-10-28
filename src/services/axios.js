import axios from "axios"

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    const errorMessage = error.response?.data?.message || "An error occurred"
    return Promise.reject(new Error(errorMessage))
  }
)

export default axiosInstance