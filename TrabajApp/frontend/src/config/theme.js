import { Dimensions, PixelRatio } from "react-native";

// Obtener dimensiones de la pantalla
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Determinar tipo de dispositivo basado en las dimensiones
export const DEVICE_TYPES = {
  PHONE: "phone",
  TABLET: "tablet",
  DESKTOP: "desktop",
};

// Función para determinar el tipo de dispositivo
export const getDeviceType = () => {
  if (SCREEN_WIDTH >= 1024) {
    return DEVICE_TYPES.DESKTOP;
  } else if (SCREEN_WIDTH >= 768) {
    return DEVICE_TYPES.TABLET;
  } else {
    return DEVICE_TYPES.PHONE;
  }
};

// Breakpoints responsivos
export const BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

// Función para obtener el tamaño responsivo
export const getResponsiveSize = (phoneSize, tabletSize, desktopSize) => {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case DEVICE_TYPES.DESKTOP:
      return desktopSize || tabletSize || phoneSize;
    case DEVICE_TYPES.TABLET:
      return tabletSize || phoneSize;
    case DEVICE_TYPES.PHONE:
    default:
      return phoneSize;
  }
};

// Función para escalar basado en el ancho de pantalla
export const wp = (percentage) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Función para escalar basado en la altura de pantalla
export const hp = (percentage) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(PixelRatio.roundToNearestPixel(value));
};

// Función para escalar fuentes responsivamente
export const getFontSize = (size) => {
  const scale = SCREEN_WIDTH / 375; // iPhone X como referencia
  const newSize = size * scale;

  // Limitar el tamaño para no exceder ciertos límites
  const minSize = size * 0.8;
  const maxSize = size * 1.3;

  return Math.max(minSize, Math.min(maxSize, newSize));
};

// Paleta de colores
export const COLORS = {
  // Colores principales
  primary: "#667eea",
  primaryDark: "#5a67d8",
  primaryLight: "#9f7aea",
  secondary: "#764ba2",

  // Estados
  success: "#28a745",
  warning: "#ffc107",
  error: "#dc3545",
  info: "#17a2b8",

  // Grises
  white: "#ffffff",
  black: "#000000",
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",

  // Aliases semánticos
  background: "#ffffff",
  surface: "#f9fafb",
  text: "#111827",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  shadow: "#000000",

  // Overlay
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",

  // Categorías de servicios
  plumbing: "#4A90E2",
  electrical: "#F5A623",
  painting: "#7ED321",
  construction: "#D0021B",
  gas: "#BD10E0",
  carpentry: "#8B572A",
};

// Tipografía
export const FONTS = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  semiBold: "Inter-SemiBold",
  bold: "Inter-Bold",
};

// Tamaños de fuente responsivos
export const FONT_SIZES = {
  xs: getFontSize(12),
  sm: getFontSize(14),
  base: getFontSize(16),
  lg: getFontSize(18),
  xl: getFontSize(20),
  "2xl": getFontSize(24),
  "3xl": getFontSize(30),
  "4xl": getFontSize(36),
  "5xl": getFontSize(48),
};

// Espaciado responsivo
export const SPACING = {
  xs: getResponsiveSize(4, 6, 8),
  sm: getResponsiveSize(8, 12, 16),
  base: getResponsiveSize(16, 20, 24),
  lg: getResponsiveSize(24, 32, 40),
  xl: getResponsiveSize(32, 40, 48),
  "2xl": getResponsiveSize(40, 48, 56),
  "3xl": getResponsiveSize(48, 56, 64),
  "4xl": getResponsiveSize(56, 64, 72),
  "5xl": getResponsiveSize(64, 72, 80),
};

// Radios de borde
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  base: 8,
  lg: 12,
  xl: 16,
  "2xl": 24,
  full: 9999,
};

// Sombras
export const SHADOWS = {
  none: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  base: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
};

// Dimensiones del layout responsivo
export const LAYOUT = {
  // Contenedor principal
  container: {
    maxWidth: getResponsiveSize(
      SCREEN_WIDTH - 32, // Phone: padding horizontal
      SCREEN_WIDTH - 64, // Tablet: más padding
      1200 // Desktop: ancho máximo
    ),
    paddingHorizontal: getResponsiveSize(16, 32, 40),
  },

  // Header
  header: {
    height: getResponsiveSize(60, 70, 80),
    paddingHorizontal: getResponsiveSize(16, 24, 32),
  },

  // Tab bar
  tabBar: {
    height: getResponsiveSize(60, 70, 80),
    paddingBottom: getResponsiveSize(8, 12, 16),
  },

  // Cards
  card: {
    padding: getResponsiveSize(16, 20, 24),
    borderRadius: BORDER_RADIUS.lg,
  },

  // Botones
  button: {
    height: getResponsiveSize(48, 52, 56),
    paddingHorizontal: getResponsiveSize(20, 24, 28),
    borderRadius: BORDER_RADIUS.lg,
  },

  // Input fields
  input: {
    height: getResponsiveSize(48, 52, 56),
    paddingHorizontal: getResponsiveSize(16, 20, 24),
    borderRadius: BORDER_RADIUS.base,
  },

  // Grid system
  grid: {
    columns: getResponsiveSize(1, 2, 3), // Columnas por defecto
    gap: getResponsiveSize(16, 20, 24),
  },
};

// Utilidades de estilo comunes
export const COMMON_STYLES = {
  // Flexbox utilities
  flex: {
    flex: 1,
  },
  flexRow: {
    flexDirection: "row",
  },
  flexColumn: {
    flexDirection: "column",
  },
  flexCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  flexBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  // Contenedores
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Texto
  textCenter: {
    textAlign: "center",
  },
  textLeft: {
    textAlign: "left",
  },
  textRight: {
    textAlign: "right",
  },

  // Cards y superficies
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.base,
  },
  surface: {
    backgroundColor: COLORS.surface,
  },

  // Bordes
  border: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
};

// Media queries para estilos condicionales
export const useResponsiveStyle = (styles) => {
  const deviceType = getDeviceType();

  return {
    ...styles.base,
    ...(deviceType === DEVICE_TYPES.TABLET && styles.tablet),
    ...(deviceType === DEVICE_TYPES.DESKTOP && styles.desktop),
  };
};

// Hook para obtener información del dispositivo
export const useDeviceInfo = () => {
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    deviceType: getDeviceType(),
    isPhone: getDeviceType() === DEVICE_TYPES.PHONE,
    isTablet: getDeviceType() === DEVICE_TYPES.TABLET,
    isDesktop: getDeviceType() === DEVICE_TYPES.DESKTOP,
    orientation: SCREEN_WIDTH > SCREEN_HEIGHT ? "landscape" : "portrait",
  };
};

export default {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  LAYOUT,
  COMMON_STYLES,
  getResponsiveSize,
  wp,
  hp,
  getFontSize,
  useResponsiveStyle,
  useDeviceInfo,
};
