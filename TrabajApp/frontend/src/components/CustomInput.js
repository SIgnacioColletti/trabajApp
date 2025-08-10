import React, { useState, forwardRef } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  FONTS,
  getResponsiveSize,
  getFontSize,
  useDeviceInfo,
} from "../config/theme";

const CustomInput = forwardRef(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      error,
      hint,
      icon,
      rightIcon,
      onRightIconPress,
      secureTextEntry = false,
      keyboardType = "default",
      multiline = false,
      numberOfLines = 1,
      editable = true,
      maxLength,
      style,
      inputStyle,
      containerStyle,
      variant = "default", // default, filled, outlined
      size = "medium", // small, medium, large
      showCharacterCount = false,
      required = false,
      autoCapitalize = "none",
      autoCorrect = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(
      !secureTextEntry
    );
    const { isPhone } = useDeviceInfo();

    // Animación para el label flotante
    const [labelAnimation] = useState(new Animated.Value(value ? 1 : 0));

    const handleFocus = () => {
      setIsFocused(true);
      if (label) {
        Animated.timing(labelAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    };

    const handleBlur = () => {
      setIsFocused(false);
      if (label && !value) {
        Animated.timing(labelAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    };

    // Obtener estilos basados en la variante
    const getVariantStyles = () => {
      const hasError = !!error;

      switch (variant) {
        case "filled":
          return {
            backgroundColor: hasError
              ? COLORS.error + "10"
              : isFocused
              ? COLORS.primary + "10"
              : COLORS.gray100,
            borderColor: hasError
              ? COLORS.error
              : isFocused
              ? COLORS.primary
              : "transparent",
            borderWidth: hasError || isFocused ? 2 : 0,
          };
        case "outlined":
          return {
            backgroundColor: "transparent",
            borderColor: hasError
              ? COLORS.error
              : isFocused
              ? COLORS.primary
              : COLORS.border,
            borderWidth: hasError || isFocused ? 2 : 1,
          };
        default:
          return {
            backgroundColor: COLORS.white,
            borderColor: hasError
              ? COLORS.error
              : isFocused
              ? COLORS.primary
              : COLORS.border,
            borderWidth: hasError || isFocused ? 2 : 1,
          };
      }
    };

    // Obtener estilos basados en el tamaño
    const getSizeStyles = () => {
      switch (size) {
        case "small":
          return {
            height: multiline ? null : getResponsiveSize(40, 44, 48),
            paddingHorizontal: getResponsiveSize(12, 14, 16),
            paddingVertical: getResponsiveSize(8, 10, 12),
            fontSize: getFontSize(14),
          };
        case "large":
          return {
            height: multiline ? null : getResponsiveSize(56, 60, 64),
            paddingHorizontal: getResponsiveSize(20, 22, 24),
            paddingVertical: getResponsiveSize(16, 18, 20),
            fontSize: getFontSize(18),
          };
        default: // medium
          return {
            height: multiline ? null : getResponsiveSize(48, 52, 56),
            paddingHorizontal: getResponsiveSize(16, 18, 20),
            paddingVertical: getResponsiveSize(12, 14, 16),
            fontSize: getFontSize(16),
          };
      }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    // Determinar el icono derecho
    const getRightIcon = () => {
      if (secureTextEntry) {
        return isPasswordVisible ? "eye-off" : "eye";
      }
      return rightIcon;
    };

    const handleRightIconPress = () => {
      if (secureTextEntry) {
        togglePasswordVisibility();
      } else if (onRightIconPress) {
        onRightIconPress();
      }
    };

    // Estilos del label animado
    const animatedLabelStyle = {
      position: "absolute",
      left: sizeStyles.paddingHorizontal + (icon ? 30 : 0),
      top: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [sizeStyles.paddingVertical + 2, -8],
      }),
      fontSize: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [sizeStyles.fontSize, getFontSize(12)],
      }),
      color: labelAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [
          COLORS.textSecondary,
          isFocused ? COLORS.primary : COLORS.textSecondary,
        ],
      }),
      backgroundColor: variant === "outlined" ? COLORS.white : "transparent",
      paddingHorizontal: variant === "outlined" ? 4 : 0,
      zIndex: 1,
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label estático (para variantes que no usan floating label) */}
        {label && variant !== "outlined" && !isFocused && !value && (
          <Text style={styles.staticLabel}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}

        {/* Contenedor del input */}
        <View style={[styles.inputContainer, variantStyles, style]}>
          {/* Icono izquierdo */}
          {icon && (
            <Ionicons
              name={icon}
              size={getResponsiveSize(20, 22, 24)}
              color={isFocused ? COLORS.primary : COLORS.textSecondary}
              style={styles.leftIcon}
            />
          )}

          {/* Label flotante para variant outlined */}
          {label && variant === "outlined" && (
            <Animated.Text style={[styles.floatingLabel, animatedLabelStyle]}>
              {label}
              {required && <Text style={styles.required}> *</Text>}
            </Animated.Text>
          )}

          {/* Input */}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              sizeStyles,
              {
                paddingLeft: icon ? 35 : sizeStyles.paddingHorizontal,
                paddingRight: getRightIcon()
                  ? 35
                  : sizeStyles.paddingHorizontal,
                textAlignVertical: multiline ? "top" : "center",
              },
              inputStyle,
            ]}
            placeholder={variant === "outlined" ? "" : placeholder}
            placeholderTextColor={COLORS.textMuted}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={numberOfLines}
            editable={editable}
            maxLength={maxLength}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            {...props}
          />

          {/* Icono derecho */}
          {getRightIcon() && (
            <TouchableOpacity
              style={styles.rightIcon}
              onPress={handleRightIconPress}
              disabled={!secureTextEntry && !onRightIconPress}
            >
              <Ionicons
                name={getRightIcon()}
                size={getResponsiveSize(20, 22, 24)}
                color={isFocused ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Fila inferior con error/hint y contador de caracteres */}
        <View style={styles.bottomRow}>
          <View style={styles.messageContainer}>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : hint ? (
              <Text style={styles.hintText}>{hint}</Text>
            ) : null}
          </View>

          {showCharacterCount && maxLength && (
            <Text style={styles.characterCount}>
              {value?.length || 0}/{maxLength}
            </Text>
          )}
        </View>
      </View>
    );
  }
);

// Componente de textarea
export const CustomTextArea = (props) => {
  return <CustomInput multiline numberOfLines={4} {...props} />;
};

// Componente de input de búsqueda
export const SearchInput = ({
  onSearch,
  onClear,
  placeholder = "Buscar...",
  ...props
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleChangeText = (text) => {
    setSearchValue(text);
    if (onSearch) {
      onSearch(text);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <CustomInput
      value={searchValue}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      icon="search"
      rightIcon={searchValue ? "close" : undefined}
      onRightIconPress={searchValue ? handleClear : undefined}
      variant="filled"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: getResponsiveSize(16, 18, 20),
  },
  staticLabel: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(14),
    color: COLORS.text,
    marginBottom: getResponsiveSize(6, 8, 10),
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: getResponsiveSize(8, 10, 12),
    position: "relative",
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
  leftIcon: {
    position: "absolute",
    left: getResponsiveSize(12, 14, 16),
    zIndex: 1,
  },
  rightIcon: {
    position: "absolute",
    right: getResponsiveSize(12, 14, 16),
    padding: 4,
    zIndex: 1,
  },
  floatingLabel: {
    fontFamily: FONTS.medium,
    backgroundColor: COLORS.white,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: getResponsiveSize(4, 6, 8),
  },
  messageContainer: {
    flex: 1,
  },
  errorText: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: COLORS.error,
    marginTop: 2,
  },
  hintText: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  characterCount: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: COLORS.textMuted,
    marginLeft: getResponsiveSize(8, 10, 12),
  },
});

export default CustomInput;
