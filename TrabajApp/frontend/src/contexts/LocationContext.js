import React, { createContext, useContext, useReducer, useEffect } from "react";
import * as Location from "expo-location";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { DEFAULT_LOCATION } from "../config/constants";

// Tipos de acciones
const LocationActionTypes = {
  SET_LOADING: "SET_LOADING",
  SET_LOCATION: "SET_LOCATION",
  SET_PERMISSION: "SET_PERMISSION",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
};

// Estado inicial
const initialState = {
  location: DEFAULT_LOCATION,
  address: null,
  hasPermission: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Reducer
function locationReducer(state, action) {
  switch (action.type) {
    case LocationActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null,
      };

    case LocationActionTypes.SET_LOCATION:
      return {
        ...state,
        location: action.payload.location,
        address: action.payload.address,
        lastUpdated: new Date().toISOString(),
        isLoading: false,
        error: null,
      };

    case LocationActionTypes.SET_PERMISSION:
      return {
        ...state,
        hasPermission: action.payload,
      };

    case LocationActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case LocationActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Context
const LocationContext = createContext(null);

// Provider
export function LocationProvider({ children }) {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      // Verificar si ya tenemos una ubicación guardada
      const savedLocation = await SecureStore.getItemAsync("userLocation");
      if (savedLocation) {
        const locationData = JSON.parse(savedLocation);
        dispatch({
          type: LocationActionTypes.SET_LOCATION,
          payload: locationData,
        });
      }

      // Solicitar permisos y obtener ubicación actual
      await requestLocationPermission();
    } catch (error) {
      console.error("Error inicializando ubicación:", error);
      dispatch({
        type: LocationActionTypes.SET_ERROR,
        payload: "Error al inicializar ubicación",
      });
    }
  };

  const requestLocationPermission = async () => {
    try {
      dispatch({ type: LocationActionTypes.SET_LOADING, payload: true });

      // Verificar permisos actuales
      const { status: existingStatus } =
        await Location.getForegroundPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        // Solicitar permisos
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      dispatch({
        type: LocationActionTypes.SET_PERMISSION,
        payload: finalStatus === "granted",
      });

      if (finalStatus === "granted") {
        await getCurrentLocation();
      } else {
        // Usar ubicación por defecto si no hay permisos
        await setDefaultLocation();

        // Mostrar alerta explicando la importancia de los permisos
        Alert.alert(
          "Permisos de Ubicación",
          "Para encontrar profesionales cerca de ti, necesitamos acceso a tu ubicación. Puedes habilitarlo en Configuración.",
          [
            { text: "Ahora no", style: "cancel" },
            {
              text: "Configuración",
              onPress: () => {
                // Aquí podrías abrir la configuración de la app
                console.log("Abrir configuración");
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error solicitando permisos:", error);
      await setDefaultLocation();
      dispatch({
        type: LocationActionTypes.SET_ERROR,
        payload: "Error al solicitar permisos de ubicación",
      });
    }
  };

  const getCurrentLocation = async () => {
    try {
      dispatch({ type: LocationActionTypes.SET_LOADING, payload: true });

      // Obtener ubicación actual con alta precisión
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 100,
      });

      const { latitude, longitude } = locationResult.coords;

      // Obtener dirección mediante geocodificación inversa
      const address = await reverseGeocode(latitude, longitude);

      const locationData = {
        location: {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        address,
      };

      // Guardar en almacenamiento local
      await SecureStore.setItemAsync(
        "userLocation",
        JSON.stringify(locationData)
      );

      dispatch({
        type: LocationActionTypes.SET_LOCATION,
        payload: locationData,
      });
    } catch (error) {
      console.error("Error obteniendo ubicación actual:", error);
      await setDefaultLocation();
      dispatch({
        type: LocationActionTypes.SET_ERROR,
        payload: "Error al obtener ubicación actual",
      });
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const result = results[0];
        return {
          street: result.street,
          streetNumber: result.streetNumber,
          district: result.district,
          city: result.city || "Rosario",
          region: result.region || "Santa Fe",
          country: result.country || "Argentina",
          postalCode: result.postalCode,
          formattedAddress: [
            result.street && result.streetNumber
              ? `${result.street} ${result.streetNumber}`
              : result.street,
            result.district,
            result.city || "Rosario",
            result.region || "Santa Fe",
          ]
            .filter(Boolean)
            .join(", "),
        };
      }

      return null;
    } catch (error) {
      console.error("Error en geocodificación inversa:", error);
      return null;
    }
  };

  const setDefaultLocation = async () => {
    const defaultLocationData = {
      location: DEFAULT_LOCATION,
      address: {
        city: "Rosario",
        region: "Santa Fe",
        country: "Argentina",
        formattedAddress: "Rosario, Santa Fe, Argentina",
      },
    };

    await SecureStore.setItemAsync(
      "userLocation",
      JSON.stringify(defaultLocationData)
    );

    dispatch({
      type: LocationActionTypes.SET_LOCATION,
      payload: defaultLocationData,
    });
  };

  const updateLocation = async (newLocation, newAddress = null) => {
    try {
      const locationData = {
        location: newLocation,
        address: newAddress || state.address,
      };

      // Guardar en almacenamiento local
      await SecureStore.setItemAsync(
        "userLocation",
        JSON.stringify(locationData)
      );

      dispatch({
        type: LocationActionTypes.SET_LOCATION,
        payload: locationData,
      });

      return { success: true };
    } catch (error) {
      console.error("Error actualizando ubicación:", error);
      dispatch({
        type: LocationActionTypes.SET_ERROR,
        payload: "Error al actualizar ubicación",
      });
      return { success: false, error: error.message };
    }
  };

  const searchLocation = async (query) => {
    try {
      if (!query || query.trim().length < 3) {
        return {
          success: false,
          error: "La búsqueda debe tener al menos 3 caracteres",
        };
      }

      const results = await Location.geocodeAsync(query + ", Argentina");

      if (results.length === 0) {
        return { success: false, error: "No se encontraron ubicaciones" };
      }

      const searchResults = results.map((result) => ({
        latitude: result.latitude,
        longitude: result.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }));

      return { success: true, results: searchResults };
    } catch (error) {
      console.error("Error buscando ubicación:", error);
      return { success: false, error: "Error al buscar ubicación" };
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Redondear a 1 decimal
  };

  const isLocationStale = () => {
    if (!state.lastUpdated) return true;

    const lastUpdate = new Date(state.lastUpdated);
    const now = new Date();
    const diffInMinutes = (now - lastUpdate) / (1000 * 60);

    return diffInMinutes > 30; // Considerar obsoleta después de 30 minutos
  };

  const refreshLocation = async () => {
    if (state.hasPermission) {
      await getCurrentLocation();
    } else {
      await requestLocationPermission();
    }
  };

  const getLocationString = () => {
    if (state.address?.formattedAddress) {
      return state.address.formattedAddress;
    }

    if (state.address?.city) {
      return `${state.address.city}, ${state.address.region || "Santa Fe"}`;
    }

    return "Rosario, Santa Fe";
  };

  const clearError = () => {
    dispatch({ type: LocationActionTypes.CLEAR_ERROR });
  };

  const value = {
    // Estado
    ...state,

    // Funciones
    requestLocationPermission,
    getCurrentLocation,
    updateLocation,
    searchLocation,
    calculateDistance,
    refreshLocation,
    getLocationString,
    clearError,

    // Utilidades
    isLocationStale,
    reverseGeocode,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

// Hook personalizado
export function useLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocation debe ser usado dentro de un LocationProvider");
  }

  return context;
}

export default LocationContext;
