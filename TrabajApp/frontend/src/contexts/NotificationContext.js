import React, { createContext, useContext, useReducer, useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Tipos de acciones
const NotificationActionTypes = {
  SET_PUSH_TOKEN: "SET_PUSH_TOKEN",
  SET_NOTIFICATIONS: "SET_NOTIFICATIONS",
  ADD_NOTIFICATION: "ADD_NOTIFICATION",
  MARK_AS_READ: "MARK_AS_READ",
  MARK_ALL_AS_READ: "MARK_ALL_AS_READ",
  REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
  SET_SETTINGS: "SET_SETTINGS",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Estado inicial
const initialState = {
  pushToken: null,
  notifications: [],
  unreadCount: 0,
  settings: {
    pushEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    newQuotations: true,
    jobUpdates: true,
    messages: true,
    payments: true,
    reviews: true,
    promotions: false,
  },
  isLoading: false,
  error: null,
};

// Reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case NotificationActionTypes.SET_PUSH_TOKEN:
      return {
        ...state,
        pushToken: action.payload,
      };

    case NotificationActionTypes.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter((n) => !n.isRead).length,
        isLoading: false,
      };

    case NotificationActionTypes.ADD_NOTIFICATION:
      const newNotifications = [action.payload, ...state.notifications];
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter((n) => !n.isRead).length,
      };

    case NotificationActionTypes.MARK_AS_READ:
      const updatedNotifications = state.notifications.map((notification) =>
        notification.id === action.payload
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter((n) => !n.isRead).length,
      };

    case NotificationActionTypes.MARK_ALL_AS_READ:
      const allReadNotifications = state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
        readAt: new Date().toISOString(),
      }));
      return {
        ...state,
        notifications: allReadNotifications,
        unreadCount: 0,
      };

    case NotificationActionTypes.REMOVE_NOTIFICATION:
      const filteredNotifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter((n) => !n.isRead).length,
      };

    case NotificationActionTypes.SET_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case NotificationActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case NotificationActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case NotificationActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Context
const NotificationContext = createContext(null);

// Provider
export function NotificationProvider({ children }) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  useEffect(() => {
    initializeNotifications();
    setupNotificationListeners();
    loadSettings();
  }, []);

  const initializeNotifications = async () => {
    try {
      await registerForPushNotificationsAsync();
      await loadNotifications();
    } catch (error) {
      console.error("Error inicializando notificaciones:", error);
      dispatch({
        type: NotificationActionTypes.SET_ERROR,
        payload: "Error al inicializar notificaciones",
      });
    }
  };

  const registerForPushNotificationsAsync = async () => {
    if (!Device.isDevice) {
      console.log(
        "Las notificaciones push solo funcionan en dispositivos físicos"
      );
      return;
    }

    try {
      // Verificar permisos existentes
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Solicitar permisos si no están otorgados
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Permisos de notificación denegados");
        return;
      }

      // Obtener token de push
      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      console.log("Push token obtenido:", token);

      // Guardar token
      await SecureStore.setItemAsync("pushToken", token);
      dispatch({
        type: NotificationActionTypes.SET_PUSH_TOKEN,
        payload: token,
      });

      // Configuración para Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
          sound: "default",
        });

        // Canal para mensajes
        await Notifications.setNotificationChannelAsync("messages", {
          name: "Mensajes",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: "default",
        });

        // Canal para trabajos
        await Notifications.setNotificationChannelAsync("jobs", {
          name: "Trabajos",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          sound: "default",
        });

        // Canal para pagos
        await Notifications.setNotificationChannelAsync("payments", {
          name: "Pagos",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          sound: "default",
        });
      }

      return token;
    } catch (error) {
      console.error("Error registrando para push notifications:", error);
      throw error;
    }
  };

  const setupNotificationListeners = () => {
    // Listener para notificaciones recibidas cuando la app está en primer plano
    const notificationListener = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    // Listener para cuando el usuario toca una notificación
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  };

  const handleNotificationReceived = (notification) => {
    console.log("Notificación recibida:", notification);

    const notificationData = {
      id: notification.request.identifier,
      title: notification.request.content.title,
      message: notification.request.content.body,
      data: notification.request.content.data,
      receivedAt: new Date().toISOString(),
      isRead: false,
    };

    dispatch({
      type: NotificationActionTypes.ADD_NOTIFICATION,
      payload: notificationData,
    });
  };

  const handleNotificationResponse = (response) => {
    console.log("Respuesta a notificación:", response);

    const notificationData = response.notification.request.content.data;

    // Marcar como leída
    markAsRead(response.notification.request.identifier);

    // Manejar navegación basada en el tipo de notificación
    if (notificationData?.actionUrl) {
      // Aquí podrías implementar navegación automática
      console.log("Navegar a:", notificationData.actionUrl);
    }
  };

  const loadNotifications = async () => {
    try {
      dispatch({ type: NotificationActionTypes.SET_LOADING, payload: true });

      // Aquí cargarías las notificaciones desde tu API
      // const response = await notificationService.getNotifications();

      // Simular carga de notificaciones
      const mockNotifications = [
        {
          id: "1",
          title: "Nueva cotización recibida",
          message:
            "Juan Pérez te envió una cotización para reparación de plomería",
          type: "new_quotation",
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { jobId: "123", quotationId: "456" },
        },
        {
          id: "2",
          title: "Trabajo completado",
          message: "El trabajo de pintura ha sido marcado como completado",
          type: "job_completed",
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          readAt: new Date(Date.now() - 3600000).toISOString(),
          data: { jobId: "789" },
        },
      ];

      dispatch({
        type: NotificationActionTypes.SET_NOTIFICATIONS,
        payload: mockNotifications,
      });
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      dispatch({
        type: NotificationActionTypes.SET_ERROR,
        payload: "Error al cargar notificaciones",
      });
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await SecureStore.getItemAsync(
        "notificationSettings"
      );
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        dispatch({
          type: NotificationActionTypes.SET_SETTINGS,
          payload: settings,
        });
      }
    } catch (error) {
      console.error("Error cargando configuraciones de notificaciones:", error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...state.settings, ...newSettings };

      await SecureStore.setItemAsync(
        "notificationSettings",
        JSON.stringify(updatedSettings)
      );

      dispatch({
        type: NotificationActionTypes.SET_SETTINGS,
        payload: updatedSettings,
      });

      return { success: true };
    } catch (error) {
      console.error("Error actualizando configuraciones:", error);
      dispatch({
        type: NotificationActionTypes.SET_ERROR,
        payload: "Error al actualizar configuraciones",
      });
      return { success: false, error: error.message };
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Actualizar en el estado local
      dispatch({
        type: NotificationActionTypes.MARK_AS_READ,
        payload: notificationId,
      });

      // Aquí enviarías la actualización a tu API
      // await notificationService.markAsRead(notificationId);

      return { success: true };
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
      return { success: false, error: error.message };
    }
  };

  const markAllAsRead = async () => {
    try {
      dispatch({ type: NotificationActionTypes.MARK_ALL_AS_READ });

      // Aquí enviarías la actualización a tu API
      // await notificationService.markAllAsRead();

      return { success: true };
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
      return { success: false, error: error.message };
    }
  };

  const removeNotification = async (notificationId) => {
    try {
      dispatch({
        type: NotificationActionTypes.REMOVE_NOTIFICATION,
        payload: notificationId,
      });

      // Aquí enviarías la eliminación a tu API
      // await notificationService.removeNotification(notificationId);

      return { success: true };
    } catch (error) {
      console.error("Error eliminando notificación:", error);
      return { success: false, error: error.message };
    }
  };

  const scheduleLocalNotification = async (
    title,
    body,
    data = {},
    delay = 0
  ) => {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: state.settings.soundEnabled ? "default" : null,
        },
        trigger: delay > 0 ? { seconds: delay } : null,
      });

      return { success: true, notificationId };
    } catch (error) {
      console.error("Error programando notificación local:", error);
      return { success: false, error: error.message };
    }
  };

  const cancelNotification = async (notificationId) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return { success: true };
    } catch (error) {
      console.error("Error cancelando notificación:", error);
      return { success: false, error: error.message };
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return { success: true };
    } catch (error) {
      console.error("Error cancelando todas las notificaciones:", error);
      return { success: false, error: error.message };
    }
  };

  const setBadgeCount = async (count) => {
    try {
      await Notifications.setBadgeCountAsync(count);
      return { success: true };
    } catch (error) {
      console.error("Error estableciendo badge count:", error);
      return { success: false, error: error.message };
    }
  };

  const clearError = () => {
    dispatch({ type: NotificationActionTypes.CLEAR_ERROR });
  };

  const getNotificationsByType = (type) => {
    return state.notifications.filter(
      (notification) => notification.type === type
    );
  };

  const getUnreadNotifications = () => {
    return state.notifications.filter((notification) => !notification.isRead);
  };

  const value = {
    // Estado
    ...state,

    // Funciones principales
    registerForPushNotificationsAsync,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    updateSettings,

    // Notificaciones locales
    scheduleLocalNotification,
    cancelNotification,
    cancelAllNotifications,
    setBadgeCount,

    // Utilidades
    getNotificationsByType,
    getUnreadNotifications,
    clearError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook personalizado
export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications debe ser usado dentro de un NotificationProvider"
    );
  }

  return context;
}

export default NotificationContext;
