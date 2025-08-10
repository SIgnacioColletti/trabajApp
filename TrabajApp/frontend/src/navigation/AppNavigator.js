import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

// Context
import { useAuth } from "../contexts/AuthContext";

// Screens - Auth
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

// Screens - Client
import ClientHomeScreen from "../screens/client/HomeScreen";
import SearchProfessionalsScreen from "../screens/client/SearchProfessionalsScreen";
import ProfessionalDetailScreen from "../screens/client/ProfessionalDetailScreen";
import RequestQuotationScreen from "../screens/client/RequestQuotationScreen";
import ClientJobsScreen from "../screens/client/JobsScreen";
import JobDetailScreen from "../screens/client/JobDetailScreen";

// Screens - Professional
import ProfessionalHomeScreen from "../screens/professional/HomeScreen";
import QuotationsScreen from "../screens/professional/QuotationsScreen";
import ProfessionalJobsScreen from "../screens/professional/JobsScreen";
import ProfessionalProfileScreen from "../screens/professional/ProfileScreen";

// Screens - Shared
import ProfileScreen from "../screens/shared/ProfileScreen";
import SettingsScreen from "../screens/shared/SettingsScreen";
import ChatScreen from "../screens/shared/ChatScreen";
import ReviewsScreen from "../screens/shared/ReviewsScreen";
import PaymentsScreen from "../screens/shared/PaymentsScreen";
import NotificationsScreen from "../screens/shared/NotificationsScreen";

// Loading Component
import LoadingScreen from "../components/LoadingScreen";

// Theme
import { COLORS, FONTS } from "../config/theme";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator para Clientes
function ClientTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "ClientHome":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Search":
              iconName = focused ? "search" : "search-outline";
              break;
            case "ClientJobs":
              iconName = focused ? "briefcase" : "briefcase-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "circle";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 12,
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen
        name="ClientHome"
        component={ClientHomeScreen}
        options={{ tabBarLabel: "Inicio" }}
      />
      <Tab.Screen
        name="Search"
        component={SearchProfessionalsScreen}
        options={{ tabBarLabel: "Buscar" }}
      />
      <Tab.Screen
        name="ClientJobs"
        component={ClientJobsScreen}
        options={{ tabBarLabel: "Trabajos" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
}

// Tab Navigator para Profesionales
function ProfessionalTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case "ProfessionalHome":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Quotations":
              iconName = focused ? "document-text" : "document-text-outline";
              break;
            case "ProfessionalJobs":
              iconName = focused ? "briefcase" : "briefcase-outline";
              break;
            case "ProfessionalProfile":
              iconName = focused ? "person" : "person-outline";
              break;
            default:
              iconName = "circle";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 12,
          marginBottom: 4,
        },
      })}
    >
      <Tab.Screen
        name="ProfessionalHome"
        component={ProfessionalHomeScreen}
        options={{ tabBarLabel: "Inicio" }}
      />
      <Tab.Screen
        name="Quotations"
        component={QuotationsScreen}
        options={{ tabBarLabel: "Cotizaciones" }}
      />
      <Tab.Screen
        name="ProfessionalJobs"
        component={ProfessionalJobsScreen}
        options={{ tabBarLabel: "Trabajos" }}
      />
      <Tab.Screen
        name="ProfessionalProfile"
        component={ProfessionalProfileScreen}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
}

// Auth Stack Navigator
function AuthStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Main App Stack Navigator
function AppStackNavigator() {
  const { user } = useAuth();
  const isClient = user?.userType === "client";

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Tab Navigators */}
      <Stack.Screen
        name="MainTabs"
        component={isClient ? ClientTabNavigator : ProfessionalTabNavigator}
      />

      {/* Modal Screens */}
      <Stack.Group screenOptions={{ presentation: "modal" }}>
        <Stack.Screen
          name="ProfessionalDetail"
          component={ProfessionalDetailScreen}
          options={{
            headerShown: true,
            title: "Perfil Profesional",
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
          }}
        />
        <Stack.Screen
          name="RequestQuotation"
          component={RequestQuotationScreen}
          options={{
            headerShown: true,
            title: "Solicitar Cotización",
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={({ route }) => ({
            headerShown: true,
            title:
              route.params?.professionalName ||
              route.params?.clientName ||
              "Chat",
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
          })}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            title: "Configuraciones",
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
          }}
        />
        <Stack.Screen
          name="Reviews"
          component={ReviewsScreen}
          options={{
            headerShown: true,
            title: "Reseñas",
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
          }}
        />
        <Stack.Screen
          name="Payments"
          component={PaymentsScreen}
          options={{
            headerShown: true,
            title: "Pagos",
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
          }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{
            headerShown: true,
            title: "Notificaciones",
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
          }}
        />
      </Stack.Group>

      {/* Full Screen Modals */}
      <Stack.Group screenOptions={{ presentation: "fullScreenModal" }}>
        <Stack.Screen
          name="JobDetail"
          component={JobDetailScreen}
          options={({ route }) => ({
            headerShown: true,
            title: route.params?.jobTitle || "Detalle del Trabajo",
            headerStyle: { backgroundColor: COLORS.background },
            headerTintColor: COLORS.text,
          })}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppStackNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
