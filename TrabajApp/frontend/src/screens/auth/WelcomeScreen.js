import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ResponsiveContainer, {
  ResponsiveColumn,
  ResponsiveRow,
} from "../../components/ResponsiveContainer";
import CustomButton from "../../components/CustomButton";
import {
  COLORS,
  FONTS,
  getResponsiveSize,
  getFontSize,
  useDeviceInfo,
} from "../../config/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }) => {
  const { isPhone, isTablet, isDesktop } = useDeviceInfo();

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Secuencia de animaciones de entrada
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const navigateToLogin = () => {
    navigation.navigate("Login");
  };

  const navigateToRegister = () => {
    navigation.navigate("Register");
  };

  // Características principales
  const features = [
    {
      icon: "search",
      title: "Encuentra Profesionales",
      description: "Busca especialistas cerca de ti con reseñas verificadas",
    },
    {
      icon: "shield-checkmark",
      title: "Pagos Seguros",
      description: "Transacciones protegidas con garantía de satisfacción",
    },
    {
      icon: "chatbubbles",
      title: "Comunicación Directa",
      description: "Chat en tiempo real para coordinar tu trabajo",
    },
    {
      icon: "star",
      title: "Calidad Garantizada",
      description: "Sistema de calificaciones y profesionales verificados",
    },
  ];

  const renderFeature = (feature, index) => (
    <Animated.View
      key={index}
      style={[
        styles.featureCard,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, index * 10],
              }),
            },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.featureIcon}>
        <Ionicons
          name={feature.icon}
          size={getResponsiveSize(24, 28, 32)}
          color={COLORS.primary}
        />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Fondo con gradiente */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ResponsiveContainer
        safeArea
        scrollable
        backgroundColor="transparent"
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header con logo */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="build"
                size={getResponsiveSize(40, 50, 60)}
                color={COLORS.white}
              />
            </View>
          </View>

          <Text style={styles.appName}>TrabajApp</Text>
          <Text style={styles.tagline}>Conectando oficios con clientes</Text>
        </Animated.View>

        {/* Sección principal */}
        <Animated.View
          style={[
            styles.mainSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ResponsiveColumn gap={getResponsiveSize(16, 20, 24)}>
            <Text style={styles.welcomeTitle}>
              ¡Bienvenido a la forma más fácil de contratar servicios!
            </Text>

            <Text style={styles.welcomeSubtitle}>
              Encuentra profesionales confiables para plomería, electricidad,
              pintura y más. Todo en un solo lugar.
            </Text>

            {/* Botones principales */}
            <ResponsiveColumn gap={getResponsiveSize(12, 16, 20)}>
              <CustomButton
                title="Iniciar Sesión"
                onPress={navigateToLogin}
                variant="secondary"
                size={isPhone ? "medium" : "large"}
                fullWidth
                style={styles.primaryButton}
              />

              <CustomButton
                title="Registrarse"
                onPress={navigateToRegister}
                variant="outline"
                size={isPhone ? "medium" : "large"}
                fullWidth
                style={styles.secondaryButton}
                textStyle={styles.secondaryButtonText}
              />
            </ResponsiveColumn>
          </ResponsiveColumn>
        </Animated.View>

        {/* Características */}
        {(isTablet || isDesktop) && (
          <Animated.View
            style={[
              styles.featuresSection,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.featuresTitle}>¿Por qué elegir TrabajApp?</Text>

            <View style={styles.featuresGrid}>
              {features.map((feature, index) => renderFeature(feature, index))}
            </View>
          </Animated.View>
        )}

        {/* Footer */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <ResponsiveRow justify="center" gap={getResponsiveSize(16, 20, 24)}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Profesionales</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1000+</Text>
              <Text style={styles.statLabel}>Trabajos</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8★</Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>
          </ResponsiveRow>

          <Text style={styles.footerText}>
            Disponible en Rosario y Gran Rosario
          </Text>
        </Animated.View>
      </ResponsiveContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: getResponsiveSize(20, 30, 40),
  },
  header: {
    alignItems: "center",
    marginBottom: getResponsiveSize(30, 40, 50),
  },
  logoContainer: {
    marginBottom: getResponsiveSize(16, 20, 24),
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
  },
  appName: {
    fontFamily: FONTS.bold,
    fontSize: getFontSize(32),
    color: COLORS.white,
    textAlign: "center",
    marginBottom: getResponsiveSize(8, 10, 12),
  },
  tagline: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(16),
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  mainSection: {
    marginBottom: getResponsiveSize(40, 50, 60),
  },
  welcomeTitle: {
    fontFamily: FONTS.bold,
    fontSize: getFontSize(24),
    color: COLORS.white,
    textAlign: "center",
    lineHeight: getFontSize(32),
  },
  welcomeSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(16),
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: getFontSize(24),
    marginBottom: getResponsiveSize(20, 24, 28),
  },
  primaryButton: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.white,
  },
  secondaryButton: {
    borderColor: "rgba(255, 255, 255, 0.8)",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    color: COLORS.white,
  },
  featuresSection: {
    marginBottom: getResponsiveSize(30, 40, 50),
  },
  featuresTitle: {
    fontFamily: FONTS.bold,
    fontSize: getFontSize(20),
    color: COLORS.white,
    textAlign: "center",
    marginBottom: getResponsiveSize(20, 24, 28),
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: getResponsiveSize("100%", "48%", "23%"),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: getResponsiveSize(16, 20, 24),
    marginBottom: getResponsiveSize(16, 20, 24),
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  featureIcon: {
    width: getResponsiveSize(48, 56, 64),
    height: getResponsiveSize(48, 56, 64),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: getResponsiveSize(24, 28, 32),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: getResponsiveSize(12, 16, 20),
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: getFontSize(14),
    color: COLORS.white,
    marginBottom: getResponsiveSize(4, 6, 8),
  },
  featureDescription: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: getFontSize(18),
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontFamily: FONTS.bold,
    fontSize: getFontSize(24),
    color: COLORS.white,
    marginBottom: getResponsiveSize(4, 6, 8),
  },
  statLabel: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: "rgba(255, 255, 255, 0.8)",
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(14),
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: getResponsiveSize(20, 24, 28),
  },
});

export default WelcomeScreen;
