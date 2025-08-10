import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS, FONTS, getResponsiveSize, getFontSize } from "../config/theme";

const LoadingScreen = ({
  message = "Cargando...",
  showLogo = true,
  backgroundColor = null,
}) => {
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Animación de rotación continua para el icono
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    rotateAnimation.start();

    return () => {
      rotateAnimation.stop();
    };
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const renderContent = () => (
    <View style={styles.container}>
      <StatusBar style="light" />

      {backgroundColor ? (
        <View style={[styles.background, { backgroundColor }]} />
      ) : (
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {showLogo && (
          <View style={styles.logoContainer}>
            <Animated.View
              style={[
                styles.logoCircle,
                {
                  transform: [{ rotate: rotation }],
                },
              ]}
            >
              <Ionicons
                name="build"
                size={getResponsiveSize(40, 50, 60)}
                color={COLORS.white}
              />
            </Animated.View>

            <Text style={styles.appName}>TrabajApp</Text>
          </View>
        )}

        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.white}
            style={styles.spinner}
          />

          <Text style={styles.loadingText}>{message}</Text>
        </View>

        {/* Dots animation */}
        <DotsLoader />
      </Animated.View>
    </View>
  );

  return renderContent();
};

// Componente de puntos animados
const DotsLoader = () => {
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const dotAnimation = (anim, delay) =>
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]);

      Animated.loop(
        Animated.parallel([
          dotAnimation(dot1Anim, 0),
          dotAnimation(dot2Anim, 200),
          dotAnimation(dot3Anim, 400),
        ])
      ).start();
    };

    animateDots();
  }, []);

  const getDotStyle = (anim) => ({
    opacity: anim,
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      },
    ],
  });

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, getDotStyle(dot1Anim)]} />
      <Animated.View style={[styles.dot, getDotStyle(dot2Anim)]} />
      <Animated.View style={[styles.dot, getDotStyle(dot3Anim)]} />
    </View>
  );
};

// Componente de loading para uso en pantallas específicas
export const InlineLoader = ({
  size = "medium",
  color = COLORS.primary,
  message,
  style,
}) => {
  const sizeMap = {
    small: "small",
    medium: "large",
    large: "large",
  };

  return (
    <View style={[styles.inlineLoader, style]}>
      <ActivityIndicator
        size={sizeMap[size]}
        color={color}
        style={styles.inlineSpinner}
      />
      {message && (
        <Text style={[styles.inlineMessage, { color }]}>{message}</Text>
      )}
    </View>
  );
};

// Componente de skeleton loader
export const SkeletonLoader = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Componente de loading overlay
export const LoadingOverlay = ({
  visible,
  message = "Procesando...",
  transparent = true,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          backgroundColor: transparent
            ? "rgba(0, 0, 0, 0.5)"
            : COLORS.background,
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.overlayContent}>
        <ActivityIndicator
          size="large"
          color={transparent ? COLORS.white : COLORS.primary}
        />
        <Text
          style={[
            styles.overlayMessage,
            {
              color: transparent ? COLORS.white : COLORS.text,
            },
          ]}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: getResponsiveSize(40, 50, 60),
  },
  logoCircle: {
    width: getResponsiveSize(80, 100, 120),
    height: getResponsiveSize(80, 100, 120),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: getResponsiveSize(40, 50, 60),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: getResponsiveSize(16, 20, 24),
  },
  appName: {
    fontFamily: FONTS.bold,
    fontSize: getFontSize(32),
    color: COLORS.white,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
  },
  spinner: {
    marginBottom: getResponsiveSize(16, 20, 24),
  },
  loadingText: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(16),
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: getResponsiveSize(20, 24, 28),
  },
  dot: {
    width: getResponsiveSize(8, 10, 12),
    height: getResponsiveSize(8, 10, 12),
    borderRadius: getResponsiveSize(4, 5, 6),
    backgroundColor: COLORS.white,
    marginHorizontal: getResponsiveSize(4, 6, 8),
  },
  inlineLoader: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getResponsiveSize(20, 24, 28),
  },
  inlineSpinner: {
    marginBottom: getResponsiveSize(8, 10, 12),
  },
  inlineMessage: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(14),
    textAlign: "center",
  },
  skeleton: {
    backgroundColor: COLORS.gray200,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  overlayContent: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: getResponsiveSize(32, 40, 48),
    paddingVertical: getResponsiveSize(24, 28, 32),
    borderRadius: getResponsiveSize(12, 16, 20),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  overlayMessage: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(16),
    textAlign: "center",
    marginTop: getResponsiveSize(12, 16, 20),
  },
});

export default LoadingScreen;
