import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  ImageBackground,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import ResponsiveContainer, {
  ResponsiveGrid,
  ResponsiveRow,
  ResponsiveColumn,
  ResponsiveCard,
} from "../../components/ResponsiveContainer";
import CustomButton from "../../components/CustomButton";
import { SearchInput } from "../../components/CustomInput";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation } from "../../contexts/LocationContext";
import { serviceService } from "../../services/api";
import {
  COLORS,
  FONTS,
  getResponsiveSize,
  getFontSize,
  useDeviceInfo,
} from "../../config/theme";
import { SERVICE_CATEGORIES } from "../../config/constants";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ClientHomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { location } = useLocation();
  const { isPhone, isTablet, isDesktop } = useDeviceInfo();

  const [categories, setCategories] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [emergencyServices, setEmergencyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadData();

    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [categoriesRes, popularRes, emergencyRes] = await Promise.all([
        serviceService.getCategories(),
        serviceService.getPopularServices(6),
        serviceService.getEmergencyServices(),
      ]);

      setCategories(categoriesRes.data.data.categories || []);
      setPopularServices(popularRes.data.data.popularServices || []);
      setEmergencyServices(emergencyRes.data.data.emergencyServices || []);
    } catch (error) {
      console.error("Error loading home data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigation.navigate("Search", {
        initialQuery: query,
        location: location,
      });
    }
  };

  const navigateToCategory = (category) => {
    navigation.navigate("Search", {
      categoryId: category.id,
      categoryName: category.name,
      location: location,
    });
  };

  const navigateToService = (service) => {
    navigation.navigate("Search", {
      serviceId: service.id,
      serviceName: service.name,
      location: location,
    });
  };

  const navigateToEmergency = () => {
    navigation.navigate("Search", {
      emergency: true,
      location: location,
    });
  };

  const navigateToNotifications = () => {
    navigation.navigate("Notifications");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <ImageBackground
        source={require("../../assets/header-bg.jpg")}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      >
        <LinearGradient
          colors={[COLORS.primary + "CC", COLORS.secondary + "CC"]}
          style={styles.headerGradient}
        >
          <ResponsiveRow justify="space-between" align="center">
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>
                {getGreeting()}, {user?.firstName}!
              </Text>
              <ResponsiveRow align="center" gap={4}>
                <Ionicons
                  name="location"
                  size={getResponsiveSize(14, 16, 18)}
                  color={COLORS.white}
                />
                <Text style={styles.location}>
                  {location?.city || "Rosario, Santa Fe"}
                </Text>
              </ResponsiveRow>
            </View>

            <TouchableOpacity
              style={styles.notificationButton}
              onPress={navigateToNotifications}
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications"
                size={getResponsiveSize(20, 22, 24)}
                color={COLORS.white}
              />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </ResponsiveRow>
        </LinearGradient>
      </ImageBackground>
    </Animated.View>
  );

  const renderSearchBar = () => (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <SearchInput
        placeholder="¿Qué servicio necesitas?"
        onSearch={handleSearch}
        variant="filled"
        size={isPhone ? "medium" : "large"}
      />
    </Animated.View>
  );

  const renderQuickActions = () => (
    <Animated.View
      style={[
        styles.quickActionsContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>

      <ResponsiveRow gap={getResponsiveSize(12, 16, 20)}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: COLORS.error + "15" }]}
          onPress={navigateToEmergency}
          activeOpacity={0.7}
        >
          <Ionicons
            name="alert-circle"
            size={getResponsiveSize(24, 28, 32)}
            color={COLORS.error}
          />
          <Text style={[styles.quickActionText, { color: COLORS.error }]}>
            Emergencia
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickAction,
            { backgroundColor: COLORS.primary + "15" },
          ]}
          onPress={() => navigation.navigate("ClientJobs")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="briefcase"
            size={getResponsiveSize(24, 28, 32)}
            color={COLORS.primary}
          />
          <Text style={[styles.quickActionText, { color: COLORS.primary }]}>
            Mis Trabajos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickAction,
            { backgroundColor: COLORS.success + "15" },
          ]}
          onPress={() => navigation.navigate("Reviews")}
          activeOpacity={0.7}
        >
          <Ionicons
            name="star"
            size={getResponsiveSize(24, 28, 32)}
            color={COLORS.success}
          />
          <Text style={[styles.quickActionText, { color: COLORS.success }]}>
            Calificar
          </Text>
        </TouchableOpacity>
      </ResponsiveRow>
    </Animated.View>
  );

  const renderCategories = () => (
    <Animated.View
      style={[
        styles.categoriesContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <ResponsiveRow justify="space-between" align="center">
        <Text style={styles.sectionTitle}>Categorías</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Search")}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Ver todas</Text>
        </TouchableOpacity>
      </ResponsiveRow>

      <ResponsiveGrid
        columns={getResponsiveSize(2, 3, 4)}
        gap={getResponsiveSize(12, 16, 20)}
      >
        {categories
          .slice(0, getResponsiveSize(4, 6, 8))
          .map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                { backgroundColor: category.colorHex + "15" },
              ]}
              onPress={() => navigateToCategory(category)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.colorHex + "25" },
                ]}
              >
                <Ionicons
                  name={getCategoryIcon(category.slug)}
                  size={getResponsiveSize(24, 28, 32)}
                  color={category.colorHex}
                />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>
                {category.professionalCount} profesionales
              </Text>
            </TouchableOpacity>
          ))}
      </ResponsiveGrid>
    </Animated.View>
  );

  const renderPopularServices = () => (
    <Animated.View
      style={[
        styles.popularContainer,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <ResponsiveRow justify="space-between" align="center">
        <Text style={styles.sectionTitle}>Servicios Populares</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Search", { popular: true })}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>Ver todos</Text>
        </TouchableOpacity>
      </ResponsiveRow>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.popularScrollContent}
      >
        {popularServices.map((service, index) => (
          <TouchableOpacity
            key={service.id}
            style={styles.popularCard}
            onPress={() => navigateToService(service)}
            activeOpacity={0.7}
          >
            <ResponsiveCard style={styles.popularCardContent}>
              <View style={styles.popularCardHeader}>
                <View
                  style={[
                    styles.popularIcon,
                    { backgroundColor: service.category.color + "15" },
                  ]}
                >
                  <Ionicons
                    name={getCategoryIcon(service.category.id)}
                    size={getResponsiveSize(20, 22, 24)}
                    color={service.category.color}
                  />
                </View>
                <View style={styles.popularRank}>
                  <Text style={styles.popularRankText}>#{service.rank}</Text>
                </View>
              </View>

              <Text style={styles.popularServiceName}>{service.name}</Text>
              <Text style={styles.popularServiceCategory}>
                {service.category.name}
              </Text>

              <ResponsiveRow justify="space-between" align="center">
                <Text style={styles.popularPrice}>
                  Desde ${service.basePrice.toLocaleString()}
                </Text>
                <Text style={styles.popularProfessionals}>
                  {service.professionalCount} pros
                </Text>
              </ResponsiveRow>
            </ResponsiveCard>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const getCategoryIcon = (slug) => {
    const iconMap = {
      plomeria: "water",
      electricidad: "flash",
      pintura: "color-palette",
      albanileria: "hammer",
      gasfiteria: "flame",
      carpinteria: "build",
    };
    return iconMap[slug] || "construct";
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {renderHeader()}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {renderSearchBar()}
        {renderQuickActions()}
        {renderCategories()}
        {renderPopularServices()}

        {/* Spacer para el tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: getResponsiveSize(120, 140, 160),
    overflow: "hidden",
  },
  headerBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  headerBackgroundImage: {
    opacity: 0.3,
  },
  headerGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: getResponsiveSize(16, 20, 24),
    paddingTop: getResponsiveSize(40, 50, 60),
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontFamily: FONTS.semiBold,
    fontSize: getFontSize(18),
    color: COLORS.white,
    marginBottom: getResponsiveSize(4, 6, 8),
  },
  location: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(14),
    color: COLORS.white,
    opacity: 0.9,
  },
  notificationButton: {
    width: getResponsiveSize(40, 44, 48),
    height: getResponsiveSize(40, 44, 48),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: getResponsiveSize(20, 22, 24),
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: getResponsiveSize(18, 20, 22),
    height: getResponsiveSize(18, 20, 22),
    backgroundColor: COLORS.error,
    borderRadius: getResponsiveSize(9, 10, 11),
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: getFontSize(10),
    color: COLORS.white,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    paddingHorizontal: getResponsiveSize(16, 20, 24),
    paddingVertical: getResponsiveSize(16, 20, 24),
    backgroundColor: COLORS.white,
    marginTop: -getResponsiveSize(20, 24, 28),
    marginHorizontal: getResponsiveSize(16, 20, 24),
    borderRadius: getResponsiveSize(12, 16, 20),
    ...{
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  quickActionsContainer: {
    paddingHorizontal: getResponsiveSize(16, 20, 24),
    paddingVertical: getResponsiveSize(20, 24, 28),
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: getFontSize(20),
    color: COLORS.text,
    marginBottom: getResponsiveSize(16, 20, 24),
  },
  seeAllText: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(14),
    color: COLORS.primary,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getResponsiveSize(16, 20, 24),
    borderRadius: getResponsiveSize(12, 16, 20),
    minHeight: getResponsiveSize(80, 90, 100),
  },
  quickActionText: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(12),
    marginTop: getResponsiveSize(8, 10, 12),
    textAlign: "center",
  },
  categoriesContainer: {
    paddingHorizontal: getResponsiveSize(16, 20, 24),
    paddingBottom: getResponsiveSize(20, 24, 28),
  },
  categoryCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getResponsiveSize(20, 24, 28),
    paddingHorizontal: getResponsiveSize(12, 16, 20),
    borderRadius: getResponsiveSize(12, 16, 20),
    minHeight: getResponsiveSize(120, 140, 160),
  },
  categoryIcon: {
    width: getResponsiveSize(48, 56, 64),
    height: getResponsiveSize(48, 56, 64),
    borderRadius: getResponsiveSize(24, 28, 32),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: getResponsiveSize(12, 16, 20),
  },
  categoryName: {
    fontFamily: FONTS.semiBold,
    fontSize: getFontSize(14),
    color: COLORS.text,
    textAlign: "center",
    marginBottom: getResponsiveSize(4, 6, 8),
  },
  categoryCount: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  popularContainer: {
    paddingVertical: getResponsiveSize(20, 24, 28),
  },
  popularScrollContent: {
    paddingHorizontal: getResponsiveSize(16, 20, 24),
    paddingRight: getResponsiveSize(32, 40, 48),
  },
  popularCard: {
    width: getResponsiveSize(260, 300, 340),
    marginRight: getResponsiveSize(16, 20, 24),
  },
  popularCardContent: {
    margin: 0,
    padding: getResponsiveSize(16, 20, 24),
  },
  popularCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getResponsiveSize(12, 16, 20),
  },
  popularIcon: {
    width: getResponsiveSize(40, 44, 48),
    height: getResponsiveSize(40, 44, 48),
    borderRadius: getResponsiveSize(20, 22, 24),
    alignItems: "center",
    justifyContent: "center",
  },
  popularRank: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: getResponsiveSize(8, 10, 12),
    paddingVertical: getResponsiveSize(4, 6, 8),
    borderRadius: getResponsiveSize(12, 14, 16),
  },
  popularRankText: {
    fontFamily: FONTS.bold,
    fontSize: getFontSize(12),
    color: COLORS.white,
  },
  popularServiceName: {
    fontFamily: FONTS.semiBold,
    fontSize: getFontSize(16),
    color: COLORS.text,
    marginBottom: getResponsiveSize(4, 6, 8),
  },
  popularServiceCategory: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(14),
    color: COLORS.textSecondary,
    marginBottom: getResponsiveSize(12, 16, 20),
  },
  popularPrice: {
    fontFamily: FONTS.semiBold,
    fontSize: getFontSize(14),
    color: COLORS.primary,
  },
  popularProfessionals: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: COLORS.textSecondary,
  },
  bottomSpacer: {
    height: getResponsiveSize(100, 120, 140),
  },
});

export default ClientHomeScreen;
