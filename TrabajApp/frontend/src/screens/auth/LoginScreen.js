import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import Toast from "react-native-toast-message";

import ResponsiveContainer, {
  ResponsiveColumn,
} from "../../components/ResponsiveContainer";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { useAuth } from "../../contexts/AuthContext";
import {
  COLORS,
  FONTS,
  getResponsiveSize,
  getFontSize,
  useDeviceInfo,
} from "../../config/theme";
import { REGEX_PATTERNS } from "../../config/constants";

const LoginScreen = ({ navigation }) => {
  const { login, isLoading } = useAuth();
  const { isPhone, isTablet } = useDeviceInfo();
  const [showPassword, setShowPassword] = useState(false);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "¡Bienvenido!",
          text2: "Has iniciado sesión exitosamente",
          position: "top",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error al iniciar sesión",
          text2: result.error || "Verifica tus credenciales",
          position: "top",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Ha ocurrido un error inesperado",
        position: "top",
      });
    }
  };

  const navigateToRegister = () => {
    navigation.navigate("Register");
  };

  const navigateToForgotPassword = () => {
    navigation.navigate("ForgotPassword");
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ResponsiveContainer
          safeArea
          scrollable
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={navigateBack}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={getResponsiveSize(24, 28, 32)}
                color={COLORS.text}
              />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.logoContainer}>
                <Ionicons
                  name="build"
                  size={getResponsiveSize(32, 40, 48)}
                  color={COLORS.primary}
                />
              </View>

              <Text style={styles.title}>Iniciar Sesión</Text>
              <Text style={styles.subtitle}>
                Ingresa a tu cuenta para continuar
              </Text>
            </View>
          </Animated.View>

          {/* Formulario */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <ResponsiveColumn gap={getResponsiveSize(20, 24, 28)}>
              {/* Email */}
              <Controller
                control={control}
                name="email"
                rules={{
                  required: "El email es obligatorio",
                  pattern: {
                    value: REGEX_PATTERNS.EMAIL,
                    message: "Ingresa un email válido",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="Email"
                    placeholder="tu@email.com"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    icon="mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    variant="outlined"
                    size={isPhone ? "medium" : "large"}
                    required
                  />
                )}
              />

              {/* Contraseña */}
              <Controller
                control={control}
                name="password"
                rules={{
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener al menos 6 caracteres",
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="Contraseña"
                    placeholder="••••••••"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    icon="lock-closed"
                    secureTextEntry={!showPassword}
                    rightIcon={showPassword ? "eye-off" : "eye"}
                    onRightIconPress={() => setShowPassword(!showPassword)}
                    variant="outlined"
                    size={isPhone ? "medium" : "large"}
                    required
                  />
                )}
              />

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={navigateToForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <CustomButton
                title="Iniciar Sesión"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                disabled={
                  !isValid || !watchedValues.email || !watchedValues.password
                }
                variant="primary"
                size={isPhone ? "medium" : "large"}
                fullWidth
                style={styles.loginButton}
              />
            </ResponsiveColumn>
          </Animated.View>

          {/* Divider */}
          {(isTablet || !isPhone) && (
            <Animated.View
              style={[
                styles.dividerContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continúa con</Text>
              <View style={styles.dividerLine} />
            </Animated.View>
          )}

          {/* Social Login (solo para tablet/desktop) */}
          {(isTablet || !isPhone) && (
            <Animated.View
              style={[
                styles.socialContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <ResponsiveColumn gap={getResponsiveSize(12, 16, 20)}>
                <CustomButton
                  title="Continuar con Google"
                  icon="logo-google"
                  variant="outline"
                  size={isPhone ? "medium" : "large"}
                  fullWidth
                  onPress={() => {
                    // Implementar Google Sign In
                    Toast.show({
                      type: "info",
                      text1: "Próximamente",
                      text2: "Login con Google estará disponible pronto",
                    });
                  }}
                />

                <CustomButton
                  title="Continuar con Facebook"
                  icon="logo-facebook"
                  variant="outline"
                  size={isPhone ? "medium" : "large"}
                  fullWidth
                  onPress={() => {
                    // Implementar Facebook Sign In
                    Toast.show({
                      type: "info",
                      text1: "Próximamente",
                      text2: "Login con Facebook estará disponible pronto",
                    });
                  }}
                />
              </ResponsiveColumn>
            </Animated.View>
          )}

          {/* Register Link */}
          <Animated.View
            style={[
              styles.registerContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.registerText}>
              ¿No tienes una cuenta?{" "}
              <TouchableOpacity
                onPress={navigateToRegister}
                activeOpacity={0.7}
              >
                <Text style={styles.registerLink}>Regístrate aquí</Text>
              </TouchableOpacity>
            </Text>
          </Animated.View>

          {/* Demo credentials (solo en desarrollo) */}
          {__DEV__ && (
            <Animated.View
              style={[
                styles.demoContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={styles.demoTitle}>Credenciales de prueba:</Text>
              <Text style={styles.demoText}>Cliente: cliente@test.com</Text>
              <Text style={styles.demoText}>
                Profesional: profesional@test.com
              </Text>
              <Text style={styles.demoText}>Contraseña: 123456</Text>
            </Animated.View>
          )}
        </ResponsiveContainer>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: getResponsiveSize(20, 30, 40),
  },
  header: {
    marginBottom: getResponsiveSize(30, 40, 50),
  },
  backButton: {
    width: getResponsiveSize(40, 44, 48),
    height: getResponsiveSize(40, 44, 48),
    borderRadius: getResponsiveSize(20, 22, 24),
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: getResponsiveSize(20, 24, 28),
  },
  headerContent: {
    alignItems: "center",
  },
  logoContainer: {
    width: getResponsiveSize(60, 70, 80),
    height: getResponsiveSize(60, 70, 80),
    backgroundColor: COLORS.primary + "15",
    borderRadius: getResponsiveSize(30, 35, 40),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: getResponsiveSize(16, 20, 24),
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: getFontSize(28),
    color: COLORS.text,
    textAlign: "center",
    marginBottom: getResponsiveSize(8, 10, 12),
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(16),
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  formContainer: {
    marginBottom: getResponsiveSize(20, 24, 28),
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(14),
    color: COLORS.primary,
  },
  loginButton: {
    marginTop: getResponsiveSize(8, 12, 16),
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: getResponsiveSize(24, 28, 32),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(14),
    color: COLORS.textSecondary,
    marginHorizontal: getResponsiveSize(16, 20, 24),
  },
  socialContainer: {
    marginBottom: getResponsiveSize(24, 28, 32),
  },
  registerContainer: {
    alignItems: "center",
    marginTop: "auto",
    paddingTop: getResponsiveSize(20, 24, 28),
  },
  registerText: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(14),
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  registerLink: {
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  demoContainer: {
    backgroundColor: COLORS.warning + "20",
    borderRadius: 8,
    padding: getResponsiveSize(12, 16, 20),
    marginTop: getResponsiveSize(20, 24, 28),
    borderWidth: 1,
    borderColor: COLORS.warning + "40",
  },
  demoTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: getFontSize(12),
    color: COLORS.warning,
    marginBottom: getResponsiveSize(4, 6, 8),
  },
  demoText: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(11),
    color: COLORS.textSecondary,
    lineHeight: getFontSize(16),
  },
});

export default LoginScreen;
