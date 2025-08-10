import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  getResponsiveSize,
  getFontSize,
  useDeviceInfo,
} from "../config/theme";

const CustomButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary", // primary, secondary, outline, ghost, danger
  size = "medium", // small, medium, large
  icon,
  iconPosition = "left", // left, right
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const { isPhone, isTablet } = useDeviceInfo();

  // Obtener estilos basados en la variante
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: disabled ? COLORS.gray300 : COLORS.primary,
          borderColor: disabled ? COLORS.gray300 : COLORS.primary,
          textColor: COLORS.white,
        };
      case "secondary":
        return {
          backgroundColor: disabled ? COLORS.gray200 : COLORS.gray100,
          borderColor: disabled ? COLORS.gray200 : COLORS.gray300,
          textColor: disabled ? COLORS.gray400 : COLORS.gray700,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: disabled ? COLORS.gray300 : COLORS.primary,
          textColor: disabled ? COLORS.gray400 : COLORS.primary,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
          textColor: disabled ? COLORS.gray400 : COLORS.primary,
        };
      case "danger":
        return {
          backgroundColor: disabled ? COLORS.gray300 : COLORS.error,
          borderColor: disabled ? COLORS.gray300 : COLORS.error,
          textColor: COLORS.white,
        };
      default:
        return {
          backgroundColor: COLORS.primary,
          borderColor: COLORS.primary,
          textColor: COLORS.white,
        };
    }
  };

  // Obtener estilos basados en el tamaño
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          height: getResponsiveSize(36, 40, 44),
          paddingHorizontal: getResponsiveSize(12, 16, 20),
          fontSize: getFontSize(14),
          iconSize: getResponsiveSize(16, 18, 20),
        };
      case "medium":
        return {
          height: getResponsiveSize(48, 52, 56),
          paddingHorizontal: getResponsiveSize(20, 24, 28),
          fontSize: getFontSize(16),
          iconSize: getResponsiveSize(20, 22, 24),
        };
      case "large":
        return {
          height: getResponsiveSize(56, 60, 64),
          paddingHorizontal: getResponsiveSize(24, 28, 32),
          fontSize: getFontSize(18),
          iconSize: getResponsiveSize(24, 26, 28),
        };
      default:
        return {
          height: getResponsiveSize(48, 52, 56),
          paddingHorizontal: getResponsiveSize(20, 24, 28),
          fontSize: getFontSize(16),
          iconSize: getResponsiveSize(20, 22, 24),
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: variantStyles.backgroundColor,
      borderColor: variantStyles.borderColor,
      height: sizeStyles.height,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      width: fullWidth ? "100%" : "auto",
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: variantStyles.textColor,
      fontSize: sizeStyles.fontSize,
    },
    textStyle,
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.contentContainer}>
          <ActivityIndicator
            size="small"
            color={variantStyles.textColor}
            style={styles.loader}
          />
          <Text style={[textStyles, { marginLeft: 8 }]}>Cargando...</Text>
        </View>
      );
    }

    if (icon && title) {
      return (
        <View style={styles.contentContainer}>
          {iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
              style={styles.iconLeft}
            />
          )}
          <Text style={textStyles} numberOfLines={1}>
            {title}
          </Text>
          {iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
              style={styles.iconRight}
            />
          )}
        </View>
      );
    }

    if (icon && !title) {
      return (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={variantStyles.textColor}
        />
      );
    }

    return (
      <Text style={textStyles} numberOfLines={1}>
        {title}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// Componente de botón flotante
export const FloatingActionButton = ({
  onPress,
  icon = "add",
  size = "medium",
  color = COLORS.primary,
  style,
  ...props
}) => {
  const sizeMap = {
    small: getResponsiveSize(48, 52, 56),
    medium: getResponsiveSize(56, 60, 64),
    large: getResponsiveSize(64, 68, 72),
  };

  const iconSizeMap = {
    small: getResponsiveSize(20, 22, 24),
    medium: getResponsiveSize(24, 26, 28),
    large: getResponsiveSize(28, 30, 32),
  };

  const fabSize = sizeMap[size];
  const fabIconSize = iconSizeMap[size];

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: fabSize,
          height: fabSize,
          backgroundColor: color,
          borderRadius: fabSize / 2,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      {...props}
    >
      <Ionicons name={icon} size={fabIconSize} color={COLORS.white} />
    </TouchableOpacity>
  );
};

// Componente de grupo de botones
export const ButtonGroup = ({
  buttons,
  selectedIndex,
  onPress,
  style,
  buttonStyle,
  selectedButtonStyle,
  textStyle,
  selectedTextStyle,
}) => {
  return (
    <View style={[styles.buttonGroup, style]}>
      {buttons.map((button, index) => {
        const isSelected = selectedIndex === index;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.groupButton,
              index === 0 && styles.firstButton,
              index === buttons.length - 1 && styles.lastButton,
              isSelected && styles.selectedButton,
              buttonStyle,
              isSelected && selectedButtonStyle,
            ]}
            onPress={() => onPress(index)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.groupButtonText,
                isSelected && styles.selectedButtonText,
                textStyle,
                isSelected && selectedTextStyle,
              ]}
            >
              {button}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    minWidth: getResponsiveSize(80, 100, 120),
  },
  text: {
    fontFamily: FONTS.semiBold,
    textAlign: "center",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    marginRight: 8,
  },
  iconLeft: {
    marginRight: getResponsiveSize(6, 8, 10),
  },
  iconRight: {
    marginLeft: getResponsiveSize(6, 8, 10),
  },
  fab: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    position: "absolute",
    bottom: getResponsiveSize(20, 24, 28),
    right: getResponsiveSize(20, 24, 28),
  },
  buttonGroup: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  groupButton: {
    flex: 1,
    paddingVertical: getResponsiveSize(12, 14, 16),
    paddingHorizontal: getResponsiveSize(16, 20, 24),
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  firstButton: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  lastButton: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderRightWidth: 0,
  },
  selectedButton: {
    backgroundColor: COLORS.primary,
  },
  groupButtonText: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(14),
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  selectedButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
  },
});

export default CustomButton;
