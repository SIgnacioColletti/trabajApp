import { Platform } from "react-native";

// API Configuration
export const API_BASE_URL = __DEV__
  ? Platform.OS === "ios"
    ? "http://localhost:3000/api/v1"
    : "http://10.0.2.2:3000/api/v1"
  : "https://api.trabajapp.com/api/v1";

export const API_TIMEOUT = 30000; // 30 segundos

// App Configuration
export const APP_NAME = "TrabajApp";
export const APP_VERSION = "1.0.0";
export const APP_BUILD = "1";

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

// File Upload Limits
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_UPLOAD = 10;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Location
export const DEFAULT_LOCATION = {
  latitude: -32.9442, // Rosario, Santa Fe
  longitude: -60.6505,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export const MAX_SEARCH_RADIUS = 50; // km
export const DEFAULT_SEARCH_RADIUS = 10; // km

// User Types
export const USER_TYPES = {
  CLIENT: "client",
  PROFESSIONAL: "professional",
};

// Job Status
export const JOB_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  QUOTED: "quoted",
  ASSIGNED: "assigned",
  CONFIRMED: "confirmed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
};

export const JOB_STATUS_LABELS = {
  [JOB_STATUS.DRAFT]: "Borrador",
  [JOB_STATUS.PENDING]: "Pendiente",
  [JOB_STATUS.QUOTED]: "Con Cotizaciones",
  [JOB_STATUS.ASSIGNED]: "Asignado",
  [JOB_STATUS.CONFIRMED]: "Confirmado",
  [JOB_STATUS.IN_PROGRESS]: "En Progreso",
  [JOB_STATUS.COMPLETED]: "Completado",
  [JOB_STATUS.DELIVERED]: "Entregado",
  [JOB_STATUS.CANCELLED]: "Cancelado",
  [JOB_STATUS.DISPUTED]: "En Disputa",
};

// Quotation Status
export const QUOTATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
  EXPIRED: "expired",
};

export const QUOTATION_STATUS_LABELS = {
  [QUOTATION_STATUS.PENDING]: "Pendiente",
  [QUOTATION_STATUS.ACCEPTED]: "Aceptada",
  [QUOTATION_STATUS.REJECTED]: "Rechazada",
  [QUOTATION_STATUS.WITHDRAWN]: "Retirada",
  [QUOTATION_STATUS.EXPIRED]: "Expirada",
};

// Urgency Levels
export const URGENCY_LEVELS = {
  NORMAL: "normal",
  URGENT: "urgent",
  EMERGENCY: "emergency",
};

export const URGENCY_LABELS = {
  [URGENCY_LEVELS.NORMAL]: "Normal",
  [URGENCY_LEVELS.URGENT]: "Urgente",
  [URGENCY_LEVELS.EMERGENCY]: "Emergencia",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  HELD: "held",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  DISPUTED: "disputed",
  FAILED: "failed",
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: "Pendiente",
  [PAYMENT_STATUS.PROCESSING]: "Procesando",
  [PAYMENT_STATUS.HELD]: "Retenido",
  [PAYMENT_STATUS.COMPLETED]: "Completado",
  [PAYMENT_STATUS.REFUNDED]: "Reembolsado",
  [PAYMENT_STATUS.DISPUTED]: "En Disputa",
  [PAYMENT_STATUS.FAILED]: "Falló",
};

// Rating Configuration
export const MIN_RATING = 1;
export const MAX_RATING = 5;
export const RATING_PRECISION = 0.1;

// Message Types
export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  LOCATION: "location",
  SYSTEM: "system",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  NEW_QUOTATION: "new_quotation",
  QUOTATION_ACCEPTED: "quotation_accepted",
  QUOTATION_REJECTED: "quotation_rejected",
  JOB_ASSIGNED: "job_assigned",
  JOB_STARTED: "job_started",
  JOB_COMPLETED: "job_completed",
  PAYMENT_RECEIVED: "payment_received",
  REVIEW_RECEIVED: "review_received",
  MESSAGE_RECEIVED: "message_received",
  SYSTEM_UPDATE: "system_update",
  PROMOTION: "promotion",
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: "dd/MM/yyyy",
  DISPLAY_TIME: "HH:mm",
  DISPLAY_DATETIME: "dd/MM/yyyy HH:mm",
  API_DATE: "yyyy-MM-dd",
  API_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
  ONLY_NUMBERS: /^\d+$/,
  ONLY_LETTERS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
  PRICE: /^\d+(\.\d{1,2})?$/,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Error de conexión. Verifica tu internet.",
  UNAUTHORIZED: "No tienes permisos para realizar esta acción.",
  SERVER_ERROR: "Error del servidor. Intenta más tarde.",
  VALIDATION_ERROR: "Los datos ingresados no son válidos.",
  NOT_FOUND: "El recurso solicitado no existe.",
  TIMEOUT: "La solicitud tardó demasiado tiempo.",
  UNKNOWN_ERROR: "Ha ocurrido un error inesperado.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Has iniciado sesión exitosamente",
  REGISTER_SUCCESS: "Te has registrado exitosamente",
  PROFILE_UPDATED: "Perfil actualizado exitosamente",
  QUOTATION_SENT: "Cotización enviada exitosamente",
  JOB_CREATED: "Trabajo creado exitosamente",
  PAYMENT_COMPLETED: "Pago completado exitosamente",
  REVIEW_SUBMITTED: "Reseña enviada exitosamente",
};

// Service Categories (should match backend)
export const SERVICE_CATEGORIES = {
  PLUMBING: {
    id: "plomeria",
    name: "Plomería",
    icon: "water",
    color: "#4A90E2",
  },
  ELECTRICAL: {
    id: "electricidad",
    name: "Electricidad",
    icon: "flash",
    color: "#F5A623",
  },
  PAINTING: {
    id: "pintura",
    name: "Pintura",
    icon: "color-palette",
    color: "#7ED321",
  },
  CONSTRUCTION: {
    id: "albanileria",
    name: "Albañilería",
    icon: "hammer",
    color: "#D0021B",
  },
  GAS: {
    id: "gasfiteria",
    name: "Gasfitería",
    icon: "flame",
    color: "#BD10E0",
  },
  CARPENTRY: {
    id: "carpinteria",
    name: "Carpintería",
    icon: "build",
    color: "#8B572A",
  },
};

// Platform specific constants
export const PLATFORM_CONSTANTS = {
  IS_IOS: Platform.OS === "ios",
  IS_ANDROID: Platform.OS === "android",
  IS_WEB: Platform.OS === "web",
  STATUS_BAR_HEIGHT: Platform.OS === "ios" ? 20 : 0,
  HEADER_HEIGHT: Platform.OS === "ios" ? 44 : 56,
};

// Animation Durations
export const ANIMATION_DURATION = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 500,
  EXTRA_LONG: 1000,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_TOKEN: "userToken",
  USER_DATA: "userData",
  LOCATION_PERMISSION: "locationPermission",
  ONBOARDING_COMPLETED: "onboardingCompleted",
  PUSH_TOKEN: "pushToken",
  THEME_PREFERENCE: "themePreference",
  LANGUAGE_PREFERENCE: "languagePreference",
};

// External URLs
export const EXTERNAL_URLS = {
  PRIVACY_POLICY: "https://trabajapp.com/privacy",
  TERMS_OF_SERVICE: "https://trabajapp.com/terms",
  SUPPORT_EMAIL: "soporte@trabajapp.com",
  SUPPORT_PHONE: "+54 341 123-4567",
  WEBSITE: "https://trabajapp.com",
  PLAY_STORE:
    "https://play.google.com/store/apps/details?id=com.trabajapp.mobile",
  APP_STORE: "https://apps.apple.com/app/trabajapp/id123456789",
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  APP_NAME,
  APP_VERSION,
  DEFAULT_LOCATION,
  USER_TYPES,
  JOB_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SERVICE_CATEGORIES,
  PLATFORM_CONSTANTS,
};
