import axios from "axios";
import { API_BASE_URL, API_TIMEOUT } from "../config/constants";
import * as SecureStore from "expo-secure-store";

// Crear instancia de axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para requests - agregar token automáticamente
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("Error obteniendo token para request:", error);
    }

    // Log de requests en desarrollo
    if (__DEV__) {
      console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error("Error en request interceptor:", error);
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo de errores
apiClient.interceptors.response.use(
  (response) => {
    // Log de responses exitosas en desarrollo
    if (__DEV__) {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }
    return response;
  },
  async (error) => {
    // Log de errores en desarrollo
    if (__DEV__) {
      console.log(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          status: error.response?.status,
          data: error.response?.data,
        }
      );
    }

    // Manejo específico de errores
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token expirado o inválido
          if (
            data?.code === "TOKEN_EXPIRED" ||
            data?.code === "INVALID_TOKEN"
          ) {
            await handleTokenExpired();
          }
          break;

        case 403:
          // Sin permisos
          console.warn("Acceso denegado:", data?.message);
          break;

        case 404:
          // Recurso no encontrado
          console.warn("Recurso no encontrado:", data?.message);
          break;

        case 429:
          // Rate limit excedido
          console.warn("Demasiadas solicitudes:", data?.message);
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Errores del servidor
          console.error("Error del servidor:", data?.message);
          break;

        default:
          console.error("Error HTTP:", status, data?.message);
      }
    } else if (error.request) {
      // Error de red
      console.error("Error de conexión:", error.message);
    } else {
      // Otro tipo de error
      console.error("Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Manejar token expirado
const handleTokenExpired = async () => {
  try {
    // Limpiar token y datos del usuario
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userData");

    // Limpiar header de autorización
    delete apiClient.defaults.headers.common["Authorization"];

    // Aquí podrías disparar un evento o navegar a login
    // Por ahora solo logueamos
    console.warn("Token expirado, usuario debe volver a iniciar sesión");
  } catch (error) {
    console.error("Error limpiando datos de token expirado:", error);
  }
};

// Servicios específicos de la API
export const authService = {
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  verifyEmail: (token) => apiClient.post("/auth/verify-email", { token }),
  resendVerification: (email) =>
    apiClient.post("/auth/resend-verification", { email }),
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    apiClient.post("/auth/reset-password", { token, password }),
};

export const userService = {
  getProfile: () => apiClient.get("/users/me"),
  updateProfile: (data) => apiClient.put("/users/me", data),
  updateSettings: (settings) => apiClient.put("/users/settings", settings),
  getUserById: (id) => apiClient.get(`/users/${id}`),
  deleteAccount: () => apiClient.delete("/users/me"),
};

export const professionalService = {
  search: (params) => apiClient.get("/professionals/search", { params }),
  updateProfile: (data) => apiClient.put("/professionals/profile", data),
  addService: (serviceData) =>
    apiClient.post("/professionals/services", serviceData),
  removeService: (serviceId) =>
    apiClient.delete(`/professionals/services/${serviceId}`),
  addPortfolio: (portfolioData) =>
    apiClient.post("/professionals/portfolio", portfolioData),
  updateAvailability: (isAvailable) =>
    apiClient.put("/professionals/availability", { isAvailable }),
  getStats: () => apiClient.get("/professionals/stats"),
};

export const serviceService = {
  getCategories: () => apiClient.get("/services/categories"),
  getServicesByCategory: (categoryId) =>
    apiClient.get(`/services/category/${categoryId}`),
  getServiceById: (serviceId) => apiClient.get(`/services/${serviceId}`),
  searchServices: (params) => apiClient.get("/services/search", { params }),
  getPopularServices: (limit = 10) =>
    apiClient.get("/services/popular", { params: { limit } }),
  getEmergencyServices: () => apiClient.get("/services/emergency"),
};

export const quotationService = {
  request: (quotationData) =>
    apiClient.post("/quotations/request", quotationData),
  getQuotations: (params) => apiClient.get("/quotations", { params }),
  getQuotationById: (id) => apiClient.get(`/quotations/${id}`),
  respondToQuotation: (id, data) =>
    apiClient.put(`/quotations/${id}/respond`, data),
  acceptQuotation: (id) => apiClient.put(`/quotations/${id}/accept`),
  rejectQuotation: (id, reason) =>
    apiClient.put(`/quotations/${id}/reject`, { reason }),
};

export const jobService = {
  getJobs: (params) => apiClient.get("/jobs", { params }),
  getJobById: (id) => apiClient.get(`/jobs/${id}`),
  createJob: (jobData) => apiClient.post("/jobs", jobData),
  updateJobStatus: (id, status) =>
    apiClient.put(`/jobs/${id}/status`, { status }),
  getJobMessages: (id) => apiClient.get(`/jobs/${id}/messages`),
  sendMessage: (id, messageData) =>
    apiClient.post(`/jobs/${id}/messages`, messageData),
  uploadJobImage: (id, imageData) =>
    apiClient.post(`/jobs/${id}/images`, imageData),
  completeJob: (id) => apiClient.put(`/jobs/${id}/complete`),
  cancelJob: (id, reason) => apiClient.put(`/jobs/${id}/cancel`, { reason }),
};

export const paymentService = {
  getPayments: (params) => apiClient.get("/payments", { params }),
  getPaymentById: (id) => apiClient.get(`/payments/${id}`),
  createPayment: (paymentData) => apiClient.post("/payments", paymentData),
  processPayment: (id) => apiClient.put(`/payments/${id}/process`),
  refundPayment: (id, reason) =>
    apiClient.put(`/payments/${id}/refund`, { reason }),
};

export const reviewService = {
  getReviews: (params) => apiClient.get("/reviews", { params }),
  getReviewById: (id) => apiClient.get(`/reviews/${id}`),
  createReview: (reviewData) => apiClient.post("/reviews", reviewData),
  updateReview: (id, data) => apiClient.put(`/reviews/${id}`, data),
  respondToReview: (id, response) =>
    apiClient.put(`/reviews/${id}/respond`, { response }),
  deleteReview: (id) => apiClient.delete(`/reviews/${id}`),
};

export const uploadService = {
  uploadImage: (imageData, options = {}) => {
    const formData = new FormData();
    formData.append("image", {
      uri: imageData.uri,
      type: imageData.type || "image/jpeg",
      name: imageData.name || "image.jpg",
    });

    if (options.category) {
      formData.append("category", options.category);
    }

    return apiClient.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadMultipleImages: (images, options = {}) => {
    const formData = new FormData();

    images.forEach((image, index) => {
      formData.append("images", {
        uri: image.uri,
        type: image.type || "image/jpeg",
        name: image.name || `image_${index}.jpg`,
      });
    });

    if (options.category) {
      formData.append("category", options.category);
    }

    return apiClient.post("/upload/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Utilidades
export const apiUtils = {
  // Manejar errores de forma consistente
  handleError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    } else if (error.request) {
      return "Error de conexión. Verifica tu internet.";
    } else {
      return "Ha ocurrido un error inesperado.";
    }
  },

  // Formatear parámetros de paginación
  formatPaginationParams: (page = 1, limit = 20, filters = {}) => {
    return {
      page,
      limit,
      ...filters,
    };
  },

  // Construir query string para URLs
  buildQueryString: (params) => {
    const filtered = Object.entries(params)
      .filter(
        ([key, value]) => value !== null && value !== undefined && value !== ""
      )
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    return filtered ? `?${filtered}` : "";
  },

  // Retry para requests fallidos
  retryRequest: async (requestFn, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // No reintentar para errores 4xx (excepto 429)
        if (
          error.response?.status >= 400 &&
          error.response?.status < 500 &&
          error.response?.status !== 429
        ) {
          throw error;
        }

        // Esperar antes del siguiente intento
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    throw lastError;
  },
};

export default apiClient;
