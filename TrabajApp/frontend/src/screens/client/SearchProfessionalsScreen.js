import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import ResponsiveContainer, {
  ResponsiveRow,
  ResponsiveColumn,
  ResponsiveCard,
} from "../../components/ResponsiveContainer";
import CustomButton, { ButtonGroup } from "../../components/CustomButton";
import { SearchInput } from "../../components/CustomInput";
import { useLocation } from "../../contexts/LocationContext";
import { professionalService, serviceService } from "../../services/api";
import {
  COLORS,
  FONTS,
  getResponsiveSize,
  getFontSize,
  useDeviceInfo,
} from "../../config/theme";

const SearchProfessionalsScreen = ({ navigation, route }) => {
  const { location } = useLocation();
  const { isPhone, isTablet } = useDeviceInfo();

  // Estados principales
  const [searchQuery, setSearchQuery] = useState(
    route.params?.initialQuery || ""
  );
  const [professionals, setProfessionals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Estados de filtros
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    route.params?.categoryId || ""
  );
  const [selectedService, setSelectedService] = useState(
    route.params?.serviceId || ""
  );
  const [sortBy, setSortBy] = useState(0); // 0: Distancia, 1: Calificación, 2: Precio
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(
    route.params?.emergency || false
  );
  const [radiusKm, setRadiusKm] = useState(10);

  // Animaciones
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      loadCategories();
      if (route.params) {
        handleInitialParams();
      } else {
        searchProfessionals(true);
      }
    }, [route.params])
  );

  const handleInitialParams = () => {
    const params = route.params;
    if (params.categoryId) setSelectedCategory(params.categoryId);
    if (params.serviceId) setSelectedService(params.serviceId);
    if (params.emergency) setEmergencyOnly(true);
    if (params.initialQuery) setSearchQuery(params.initialQuery);

    searchProfessionals(true);
  };

  const loadCategories = async () => {
    try {
      const response = await serviceService.getCategories();
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const searchProfessionals = async (reset = false) => {
    if (loading) return;

    try {
      setLoading(true);

      const currentPage = reset ? 1 : page;
      const searchParams = {
        page: currentPage,
        limit: 20,
        latitude: location?.latitude || -32.9442,
        longitude: location?.longitude || -60.6505,
        radiusKm,
        ...(searchQuery && { query: searchQuery }),
        ...(selectedCategory && { categoryId: selectedCategory }),
        ...(selectedService && { serviceId: selectedService }),
        ...(minRating && { minRating }),
        ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
        ...(verifiedOnly && { verifiedOnly: true }),
        ...(emergencyOnly && { emergencyOnly: true }),
        sortBy: getSortParam(),
      };

      const response = await professionalService.search(searchParams);
      const newProfessionals = response.data.data.professionals || [];

      if (reset) {
        setProfessionals(newProfessionals);
        setPage(2);
      } else {
        setProfessionals((prev) => [...prev, ...newProfessionals]);
        setPage(currentPage + 1);
      }

      setHasMore(newProfessionals.length === 20);
    } catch (error) {
      console.error("Error searching professionals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSortParam = () => {
    switch (sortBy) {
      case 1:
        return "rating";
      case 2:
        return "price";
      default:
        return "distance";
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await searchProfessionals(true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      searchProfessionals(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() || selectedCategory || selectedService) {
      searchProfessionals(true);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedService("");
    setMinRating(0);
    setMaxPrice("");
    setVerifiedOnly(false);
    setEmergencyOnly(false);
    setRadiusKm(10);
    setSortBy(0);
    searchProfessionals(true);
  };

  const applyFilters = () => {
    setShowFilters(false);
    searchProfessionals(true);
  };

  const navigateToProfessional = (professional) => {
    navigation.navigate("ProfessionalDetail", {
      professionalId: professional.id,
      professional,
    });
  };

  const navigateToRequestQuotation = (professional) => {
    navigation.navigate("RequestQuotation", {
      professionalId: professional.id,
      professional,
    });
  };

  const renderProfessionalCard = ({ item: professional, index }) => {
    const cardOpacity = fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const cardTranslateY = fadeAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [20, 0],
    });

    return (
      <Animated.View
        style={[
          styles.professionalCardWrapper,
          {
            opacity: cardOpacity,
            transform: [{ translateY: cardTranslateY }],
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigateToProfessional(professional)}
        >
          <ResponsiveCard style={styles.professionalCard}>
            {/* Header con foto y verificación */}
            <ResponsiveRow gap={getResponsiveSize(12, 16, 20)}>
              <View style={styles.professionalAvatar}>
                {professional.profileImage ? (
                  <Image
                    source={{ uri: professional.profileImage }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons
                    name="person"
                    size={getResponsiveSize(24, 28, 32)}
                    color={COLORS.textSecondary}
                  />
                )}
                {professional.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark"
                      size={getResponsiveSize(12, 14, 16)}
                      color={COLORS.white}
                    />
                  </View>
                )}
              </View>

              <View style={styles.professionalInfo}>
                <ResponsiveRow justify="space-between" align="flex-start">
                  <View style={styles.nameContainer}>
                    <Text style={styles.professionalName}>
                      {professional.firstName} {professional.lastName}
                    </Text>
                    {professional.isPremium && (
                      <View style={styles.premiumBadge}>
                        <Ionicons
                          name="star"
                          size={getResponsiveSize(10, 12, 14)}
                          color={COLORS.warning}
                        />
                        <Text style={styles.premiumText}>Premium</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.distanceContainer}>
                    <Ionicons
                      name="location"
                      size={getResponsiveSize(12, 14, 16)}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.distanceText}>
                      {professional.distance}km
                    </Text>
                  </View>
                </ResponsiveRow>

                <ResponsiveRow align="center" gap={4}>
                  <View style={styles.ratingContainer}>
                    <Ionicons
                      name="star"
                      size={getResponsiveSize(12, 14, 16)}
                      color={COLORS.warning}
                    />
                    <Text style={styles.ratingText}>
                      {professional.rating.toFixed(1)}
                    </Text>
                    <Text style={styles.ratingCount}>
                      ({professional.ratingCount})
                    </Text>
                  </View>

                  <Text style={styles.separator}>•</Text>

                  <Text style={styles.experienceText}>
                    {professional.experienceYears} años exp.
                  </Text>
                </ResponsiveRow>

                <Text style={styles.cityText} numberOfLines={1}>
                  {professional.city}
                </Text>
              </View>
            </ResponsiveRow>

            {/* Servicios */}
            {professional.services && professional.services.length > 0 && (
              <View style={styles.servicesContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.servicesScroll}
                >
                  {professional.services.slice(0, 3).map((service, index) => (
                    <View key={index} style={styles.serviceTag}>
                      <Text style={styles.serviceTagText}>{service.name}</Text>
                      <Text style={styles.servicePriceText}>
                        ${service.price?.toLocaleString()}
                      </Text>
                    </View>
                  ))}
                  {professional.services.length > 3 && (
                    <View style={styles.moreServicesTag}>
                      <Text style={styles.moreServicesText}>
                        +{professional.services.length - 3}
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            {/* Bio */}
            {professional.bio && (
              <Text style={styles.bioText} numberOfLines={2}>
                {professional.bio}
              </Text>
            )}

            {/* Características */}
            <ResponsiveRow gap={getResponsiveSize(8, 12, 16)}>
              {professional.hasVehicle && (
                <View style={styles.featureTag}>
                  <Ionicons
                    name="car"
                    size={getResponsiveSize(12, 14, 16)}
                    color={COLORS.primary}
                  />
                  <Text style={styles.featureText}>Vehículo</Text>
                </View>
              )}

              {professional.hasTools && (
                <View style={styles.featureTag}>
                  <Ionicons
                    name="build"
                    size={getResponsiveSize(12, 14, 16)}
                    color={COLORS.primary}
                  />
                  <Text style={styles.featureText}>Herramientas</Text>
                </View>
              )}

              {professional.acceptsEmergencies && (
                <View
                  style={[
                    styles.featureTag,
                    { backgroundColor: COLORS.error + "15" },
                  ]}
                >
                  <Ionicons
                    name="flash"
                    size={getResponsiveSize(12, 14, 16)}
                    color={COLORS.error}
                  />
                  <Text style={[styles.featureText, { color: COLORS.error }]}>
                    Emergencias
                  </Text>
                </View>
              )}
            </ResponsiveRow>

            {/* Botones de acción */}
            <ResponsiveRow gap={getResponsiveSize(8, 12, 16)}>
              <CustomButton
                title="Ver Perfil"
                variant="outline"
                size="small"
                style={styles.actionButton}
                onPress={() => navigateToProfessional(professional)}
              />

              <CustomButton
                title="Cotizar"
                variant="primary"
                size="small"
                style={styles.actionButton}
                onPress={() => navigateToRequestQuotation(professional)}
              />
            </ResponsiveRow>
          </ResponsiveCard>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchInput
        value={searchQuery}
        onSearch={handleSearch}
        placeholder="Buscar profesionales..."
        size={isPhone ? "medium" : "large"}
      />

      <ResponsiveRow justify="space-between" align="center">
        <ButtonGroup
          buttons={["Distancia", "Calificación", "Precio"]}
          selectedIndex={sortBy}
          onPress={(index) => {
            setSortBy(index);
            searchProfessionals(true);
          }}
          style={styles.sortButtons}
        />

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="options"
            size={getResponsiveSize(20, 22, 24)}
            color={COLORS.primary}
          />
          <Text style={styles.filterButtonText}>Filtros</Text>
        </TouchableOpacity>
      </ResponsiveRow>

      {/* Filtros activos */}
      {(selectedCategory ||
        selectedService ||
        emergencyOnly ||
        verifiedOnly) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeFilters}
        >
          {selectedCategory && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Categoría</Text>
              <TouchableOpacity onPress={() => setSelectedCategory("")}>
                <Ionicons
                  name="close"
                  size={getResponsiveSize(14, 16, 18)}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          )}

          {emergencyOnly && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Emergencias</Text>
              <TouchableOpacity onPress={() => setEmergencyOnly(false)}>
                <Ionicons
                  name="close"
                  size={getResponsiveSize(14, 16, 18)}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          )}

          {verifiedOnly && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Verificados</Text>
              <TouchableOpacity onPress={() => setVerifiedOnly(false)}>
                <Ionicons
                  name="close"
                  size={getResponsiveSize(14, 16, 18)}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      <Text style={styles.resultsCount}>
        {professionals.length} profesionales encontrados
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="search"
        size={getResponsiveSize(64, 72, 80)}
        color={COLORS.textMuted}
      />
      <Text style={styles.emptyTitle}>No se encontraron profesionales</Text>
      <Text style={styles.emptySubtitle}>
        Intenta ajustar los filtros o ampliar el área de búsqueda
      </Text>
      <CustomButton
        title="Limpiar Filtros"
        variant="outline"
        onPress={clearFilters}
        style={styles.clearFiltersButton}
      />
    </View>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <ResponsiveContainer safeArea>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Filtros</Text>
          <TouchableOpacity
            onPress={() => setShowFilters(false)}
            style={styles.closeButton}
          >
            <Ionicons
              name="close"
              size={getResponsiveSize(24, 28, 32)}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filterContent}>
          {/* Aquí irían todos los filtros detallados */}
          <Text style={styles.filterSectionTitle}>Categoría</Text>
          {/* Implementar selector de categorías */}

          <Text style={styles.filterSectionTitle}>Calificación mínima</Text>
          {/* Implementar selector de rating */}

          <Text style={styles.filterSectionTitle}>Precio máximo</Text>
          {/* Implementar input de precio */}
        </ScrollView>

        <View style={styles.modalFooter}>
          <CustomButton
            title="Limpiar"
            variant="outline"
            onPress={clearFilters}
            style={styles.modalButton}
          />
          <CustomButton
            title="Aplicar"
            variant="primary"
            onPress={applyFilters}
            style={styles.modalButton}
          />
        </View>
      </ResponsiveContainer>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <FlatList
        data={professionals}
        renderItem={renderProfessionalCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={() =>
          loading && professionals.length > 0 ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null
        }
      />

      {renderFilterModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: getResponsiveSize(16, 20, 24),
    paddingTop: getResponsiveSize(16, 20, 24),
    paddingBottom: getResponsiveSize(12, 16, 20),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sortButtons: {
    flex: 1,
    marginRight: getResponsiveSize(12, 16, 20),
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: getResponsiveSize(12, 16, 20),
    paddingVertical: getResponsiveSize(8, 10, 12),
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: getResponsiveSize(8, 10, 12),
    backgroundColor: COLORS.white,
  },
  filterButtonText: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(14),
    color: COLORS.primary,
    marginLeft: getResponsiveSize(4, 6, 8),
  },
  activeFilters: {
    paddingVertical: getResponsiveSize(8, 10, 12),
    paddingRight: getResponsiveSize(16, 20, 24),
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: getResponsiveSize(8, 10, 12),
    paddingVertical: getResponsiveSize(4, 6, 8),
    borderRadius: getResponsiveSize(12, 14, 16),
    marginRight: getResponsiveSize(8, 10, 12),
  },
  filterChipText: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(12),
    color: COLORS.primary,
    marginRight: getResponsiveSize(4, 6, 8),
  },
  resultsCount: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(14),
    color: COLORS.textSecondary,
    marginTop: getResponsiveSize(8, 10, 12),
  },
  listContent: {
    paddingHorizontal: getResponsiveSize(16, 20, 24),
    paddingBottom: getResponsiveSize(100, 120, 140),
  },
  professionalCardWrapper: {
    marginVertical: getResponsiveSize(8, 10, 12),
  },
  professionalCard: {
    margin: 0,
    padding: getResponsiveSize(16, 20, 24),
  },
  professionalAvatar: {
    width: getResponsiveSize(60, 70, 80),
    height: getResponsiveSize(60, 70, 80),
    borderRadius: getResponsiveSize(30, 35, 40),
    backgroundColor: COLORS.gray100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: getResponsiveSize(30, 35, 40),
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: getResponsiveSize(20, 22, 24),
    height: getResponsiveSize(20, 22, 24),
    backgroundColor: COLORS.success,
    borderRadius: getResponsiveSize(10, 11, 12),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  professionalInfo: {
    flex: 1,
  },
  nameContainer: {
    flex: 1,
  },
  professionalName: {
    fontFamily: FONTS.semiBold,
    fontSize: getFontSize(16),
    color: COLORS.text,
    marginBottom: getResponsiveSize(4, 6, 8),
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warning + "15",
    paddingHorizontal: getResponsiveSize(6, 8, 10),
    paddingVertical: getResponsiveSize(2, 4, 6),
    borderRadius: getResponsiveSize(8, 10, 12),
    marginTop: getResponsiveSize(2, 4, 6),
  },
  premiumText: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(10),
    color: COLORS.warning,
    marginLeft: getResponsiveSize(2, 4, 6),
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: COLORS.textSecondary,
    marginLeft: getResponsiveSize(2, 4, 6),
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontFamily: FONTS.semiBold,
    fontSize: getFontSize(12),
    color: COLORS.text,
    marginLeft: getResponsiveSize(2, 4, 6),
  },
  ratingCount: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: COLORS.textSecondary,
    marginLeft: getResponsiveSize(2, 4, 6),
  },
  separator: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: COLORS.textSecondary,
  },
  experienceText: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: COLORS.textSecondary,
  },
  cityText: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(12),
    color: COLORS.textSecondary,
    marginTop: getResponsiveSize(2, 4, 6),
  },
  servicesContainer: {
    marginVertical: getResponsiveSize(12, 16, 20),
  },
  servicesScroll: {
    paddingRight: getResponsiveSize(16, 20, 24),
  },
  serviceTag: {
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: getResponsiveSize(8, 10, 12),
    paddingVertical: getResponsiveSize(4, 6, 8),
    borderRadius: getResponsiveSize(8, 10, 12),
    marginRight: getResponsiveSize(8, 10, 12),
    alignItems: "center",
  },
  serviceTagText: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(11),
    color: COLORS.primary,
  },
  servicePriceText: {
    fontFamily: FONTS.semiBold,
    fontSize: getFontSize(10),
    color: COLORS.primary,
    marginTop: getResponsiveSize(1, 2, 3),
  },
  moreServicesTag: {
    backgroundColor: COLORS.gray200,
    paddingHorizontal: getResponsiveSize(8, 10, 12),
    paddingVertical: getResponsiveSize(6, 8, 10),
    borderRadius: getResponsiveSize(8, 10, 12),
    alignItems: "center",
    justifyContent: "center",
  },
  moreServicesText: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(11),
    color: COLORS.textSecondary,
  },
  bioText: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(14),
    color: COLORS.textSecondary,
    lineHeight: getFontSize(20),
    marginBottom: getResponsiveSize(12, 16, 20),
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "15",
    paddingHorizontal: getResponsiveSize(6, 8, 10),
    paddingVertical: getResponsiveSize(4, 6, 8),
    borderRadius: getResponsiveSize(6, 8, 10),
  },
  featureText: {
    fontFamily: FONTS.medium,
    fontSize: getFontSize(10),
    color: COLORS.primary,
    marginLeft: getResponsiveSize(2, 4, 6),
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: getResponsiveSize(60, 80, 100),
    paddingHorizontal: getResponsiveSize(20, 24, 28),
  },
  emptyTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: getFontSize(18),
    color: COLORS.text,
    textAlign: "center",
    marginTop: getResponsiveSize(16, 20, 24),
    marginBottom: getResponsiveSize(8, 10, 12),
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: getFontSize(14),
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: getFontSize(20),
    marginBottom: getResponsiveSize(24, 28, 32),
  },
  clearFiltersButton: {
    paddingHorizontal: getResponsiveSize(24, 28, 32),
  },
  loadingFooter: {
    paddingVertical: getResponsiveSize(20, 24, 28),
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: getResponsiveSize(16, 20, 24),
    paddingVertical: getResponsiveSize(16, 20, 24),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: getFontSize(20),
    color: COLORS.text,
  },
  closeButton: {
    width: getResponsiveSize(32, 36, 40),
    height: getResponsiveSize(32, 36, 40),
    alignItems: "center",
    justifyContent: "center",
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: getResponsiveSize(16, 20, 24),
  },
  filterSectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: getFontSize(16),
    color: COLORS.text,
    marginTop: getResponsiveSize(20, 24, 28),
    marginBottom: getResponsiveSize(12, 16, 20),
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: getResponsiveSize(16, 20, 24),
    paddingVertical: getResponsiveSize(16, 20, 24),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: getResponsiveSize(12, 16, 20),
  },
  modalButton: {
    flex: 1,
  },
});

export default SearchProfessionalsScreen;
