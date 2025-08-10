import React, { createContext, useContext, useReducer, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../config/constants";
import { apiClient } from "../services/api";

// Tipos de acciones
const AuthActionTypes = {
  LOADING: "LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  UPDATE_USER: "UPDATE_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_ERROR: "SET_ERROR",
  RESTORE_TOKEN: "RESTORE_TOKEN",
};

// Estado inicial
const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AuthActionTypes.LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AuthActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AuthActionTypes.RESTORE_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: !!action.payload.token,
        isLoading: false,
      };

    default:
      return state;
  }
}

// Context
const AuthContext = createContext(null);

// Provider
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restaurar token al iniciar la app
  useEffect(() => {
    restoreToken();
  }, []);

  const restoreToken = async () => {
    try {
      dispatch({ type: AuthActionTypes.LOADING, payload: true });

      const token = await SecureStore.getItemAsync("userToken");
      const userData = await SecureStore.getItemAsync("userData");

      if (token && userData) {
        const user = JSON.parse(userData);

        // Configurar el token en el cliente API
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Verificar que el token siga siendo válido
        try {
          const response = await apiClient.get("/users/me");

          dispatch({
            type: AuthActionTypes.RESTORE_TOKEN,
            payload: {
              token,
              user: response.data.data.user,
            },
          });
        } catch (error) {
          // Token inválido, limpiar datos
          await logout();
        }
      } else {
        dispatch({ type: AuthActionTypes.LOADING, payload: false });
      }
    } catch (error) {
      console.error("Error restaurando token:", error);
      dispatch({ type: AuthActionTypes.LOADING, payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: AuthActionTypes.LOADING, payload: true });

      const response = await apiClient.post("/auth/login", {
        email: email.toLowerCase().trim(),
        password,
      });

      const { user, token } = response.data.data;

      // Guardar en almacenamiento seguro
      await SecureStore.setItemAsync("userToken", token);
      await SecureStore.setItemAsync("userData", JSON.stringify(user));

      // Configurar header de autorización
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al iniciar sesión";
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.LOADING, payload: true });

      const response = await apiClient.post("/auth/register", {
        email: userData.email.toLowerCase().trim(),
        password: userData.password,
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        phone: userData.phone.trim(),
        userType: userData.userType,
        address: userData.address?.trim(),
        city: userData.city || "Rosario",
        latitude: userData.latitude,
        longitude: userData.longitude,
      });

      const { user, token } = response.data.data;

      // Guardar en almacenamiento seguro
      await SecureStore.setItemAsync("userToken", token);
      await SecureStore.setItemAsync("userData", JSON.stringify(user));

      // Configurar header de autorización
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al registrarse";
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Limpiar almacenamiento seguro
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userData");

      // Limpiar header de autorización
      delete apiClient.defaults.headers.common["Authorization"];

      dispatch({ type: AuthActionTypes.LOGOUT });

      return { success: true };
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Aún así limpiar el estado local
      dispatch({ type: AuthActionTypes.LOGOUT });
      return { success: true };
    }
  };

  const updateProfile = async (updateData) => {
    try {
      dispatch({ type: AuthActionTypes.LOADING, payload: true });

      const response = await apiClient.put("/users/me", updateData);
      const updatedUser = response.data.data.user;

      // Actualizar datos en almacenamiento seguro
      const currentUserData = await SecureStore.getItemAsync("userData");
      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        const newUserData = { ...currentUser, ...updatedUser };
        await SecureStore.setItemAsync("userData", JSON.stringify(newUserData));
      }

      dispatch({
        type: AuthActionTypes.UPDATE_USER,
        payload: updatedUser,
      });

      dispatch({ type: AuthActionTypes.LOADING, payload: false });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al actualizar perfil";
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const verifyEmail = async (token) => {
    try {
      dispatch({ type: AuthActionTypes.LOADING, payload: true });

      const response = await apiClient.post("/auth/verify-email", { token });

      // Actualizar estado de verificación del usuario
      dispatch({
        type: AuthActionTypes.UPDATE_USER,
        payload: { isVerified: true },
      });

      dispatch({ type: AuthActionTypes.LOADING, payload: false });

      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al verificar email";
      dispatch({
        type: AuthActionTypes.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const resendVerification = async () => {
    try {
      if (!state.user?.email) {
        throw new Error("No se encontró email del usuario");
      }

      const response = await apiClient.post("/auth/resend-verification", {
        email: state.user.email,
      });

      return {
        success: true,
        message: response.data.message || "Verificación reenviada exitosamente",
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error al reenviar verificación";
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  const value = {
    // Estado
    ...state,

    // Acciones
    login,
    register,
    logout,
    updateProfile,
    verifyEmail,
    resendVerification,
    clearError,
    restoreToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }

  return context;
}

export default AuthContext;
