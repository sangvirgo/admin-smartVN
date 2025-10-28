import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1/admin"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }

    if (error.response?.status === 403) {
      // Access denied
      window.location.href = "/unauthorized"
    }

    const errorMessage = error.response?.data?.message || error.message || "An error occurred"
    console.error("[API Error]", errorMessage)

    return Promise.reject(error)
  },
)

/**
 * Authentication Service
 * NOTE: Login endpoint is NOT in admin service - handled by user-service
 * This is just a placeholder for reference
 */
export const authService = {
  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Response with token and user data
   */
  login: (email, password) => {
    // Login endpoint is in user-service, not admin-service
    // You need to call: POST http://localhost:8081/api/v1/auth/login
    const AUTH_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:8080/api/v1"
    return axios.post(`${AUTH_BASE_URL}/login`, { email, password })
  },
}

/**
 * Dashboard Service (ADMIN only)
 */
export const dashboardService = {
  /**
   * Get dashboard overview with statistics
   * @returns {Promise} Dashboard overview data
   */
  getOverview: () => api.get("/dashboard/overview"),

  /**
   * Get revenue chart data
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} Revenue chart data
   */
  getRevenueChart: (startDate, endDate) => {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return api.get("/dashboard/revenue", { params })
  },
}

/**
 * User Service
 */
export const userService = {
  /**
   * Get all users with pagination and filters
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @param {string} search - Search query
   * @param {string} role - Filter by role (ADMIN, STAFF, CUSTOMER)
   * @param {boolean} isBanned - Filter by ban status
   * @returns {Promise} Paginated users list
   */
  getUsers: (page = 0, size = 20, search = "", role = "", isBanned = null) => {
    const params = { page, size }
    if (search) params.search = search
    if (role) params.role = role
    if (isBanned !== null) params.isBanned = isBanned
    return api.get("/users", { params })
  },

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise} User data
   */
  getUserById: (id) => api.get(`/users/${id}`),

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise} Delete response
   */
  deleteUser: (id) => api.delete(`/users/${id}`),

  /**
   * Ban a user
   * @param {number} id - User ID
   * @returns {Promise} Ban response
   */
  banUser: (id) => api.put(`/users/${id}/ban`),

  /**
   * Unban a user
   * @param {number} id - User ID
   * @returns {Promise} Unban response
   */
  unbanUser: (id) => api.put(`/users/${id}/unban`),

  /**
   * Warn a user
   * @param {number} id - User ID
   * @returns {Promise} Warn response
   */
  warnUser: (id) => api.put(`/users/${id}/warn`),

  /**
   * Change user role
   * @param {number} userId - User ID
   * @param {string} role - New role (ADMIN, STAFF, CUSTOMER)
   * @returns {Promise} Role change response
   */
  changeRole: (userId, role) => api.put(`/users/${userId}/role`, { role }),

  /**
   * Get user statistics
   * @returns {Promise} User stats data
   */
  getStats: () => api.get("/users/stats"),
}

/**
 * Product Service
 */
export const productService = {
  /**
   * Get all products with pagination and filters
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @param {string} search - Search query
   * @param {number} categoryId - Filter by category
   * @param {boolean} isActive - Filter by active status
   * @returns {Promise} Paginated products list
   */
  getProducts: (page = 0, size = 20, search = "", categoryId = null, isActive = null) => {
    const params = { page, size }
    if (search) params.search = search
    if (categoryId) params.categoryId = categoryId
    if (isActive !== null) params.isActive = isActive
    return api.get("/products", { params })
  },

  /**
   * Get product by ID
   * @param {number} id - Product ID
   * @returns {Promise} Product data
   */
  getProductById: (id) => api.get(`/products/${id}`),

  /**
   * Create new product
   * @param {Object} data - Product data (CreateProductRequest)
   * @returns {Promise} Created product
   */
  createProduct: (data) => api.post("/products", data),

  /**
   * Update product
   * @param {number} id - Product ID
   * @param {Object} data - Updated product data (UpdateProductRequest)
   * @returns {Promise} Updated product
   */
  updateProduct: (id, data) => api.put(`/products/${id}`, data),

  /**
   * Toggle product active status
   * @param {number} id - Product ID
   * @returns {Promise} Toggle response
   */
  toggleActive: (id) => api.put(`/products/${id}/toggle-active`),

  /**
   * Delete product
   * @param {number} id - Product ID
   * @returns {Promise} Delete response
   */
  deleteProduct: (id) => api.delete(`/products/${id}`),

  /**
   * Add inventory to product
   * @param {number} productId - Product ID
   * @param {Object} data - Inventory data { size, quantity, price, discountPercent }
   * @returns {Promise} Inventory response
   */
  addInventory: (productId, data) => api.post(`/products/${productId}/inventory`, data),

  /**
   * Update product inventory
   * @param {number} productId - Product ID
   * @param {number} inventoryId - Inventory ID
   * @param {Object} data - Updated inventory data
   * @returns {Promise} Updated inventory
   */
  updateInventory: (productId, inventoryId, data) => api.put(`/products/${productId}/inventory/${inventoryId}`, data),

  /**
   * Upload product image
   * @param {number} productId - Product ID
   * @param {File} file - Image file
   * @returns {Promise} Upload response with image URL
   */
  uploadImage: (productId, file) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post(`/products/${productId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },

  /**
   * Delete product image
   * @param {number} imageId - Image ID
   * @returns {Promise} Delete response
   */
  deleteImage: (imageId) => api.delete(`/products/images/${imageId}`),
}

/**
 * Order Service
 */
export const orderService = {
  /**
   * Get all orders with pagination and filters
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @param {string} search - Search query
   * @param {string} status - Filter by status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
   * @param {string} paymentStatus - Filter by payment status
   * @param {string} startDate - Start date filter (YYYY-MM-DD)
   * @param {string} endDate - End date filter (YYYY-MM-DD)
   * @returns {Promise} Paginated orders list
   */
  getOrders: (page = 0, size = 20, search = "", status = "", paymentStatus = "", startDate = "", endDate = "") => {
    const params = { page, size }
    if (search) params.search = search
    if (status) params.status = status
    if (paymentStatus) params.paymentStatus = paymentStatus
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return api.get("/orders", { params })
  },

  /**
   * Get order by ID
   * @param {number} id - Order ID
   * @returns {Promise} Order data
   */
  getOrderById: (id) => api.get(`/orders/${id}`),

  /**
   * Update order status
   * @param {number} id - Order ID
   * @param {string} status - New status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
   * @returns {Promise} Updated order
   */
  updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),

  /**
   * Get order statistics
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} Order stats
   */
  getStats: (startDate = "", endDate = "") => {
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    return api.get("/orders/stats", { params })
  },
}

/**
 * Review Service
 */
export const reviewService = {
  /**
   * Get all reviews with pagination and filters
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @param {string} status - Filter by status (PENDING, APPROVED, REJECTED)
   * @param {number} productId - Filter by product
   * @param {number} userId - Filter by user
   * @returns {Promise} Paginated reviews list
   */
  getReviews: (page = 0, size = 20, status = "", productId = null, userId = null) => {
    const params = { page, size }
    if (status) params.status = status
    if (productId) params.productId = productId
    if (userId) params.userId = userId
    return api.get("/reviews", { params })
  },

  /**
   * Delete review
   * @param {number} id - Review ID
   * @returns {Promise} Delete response
   */
  deleteReview: (id) => api.delete(`/reviews/${id}`),
}

export default api
