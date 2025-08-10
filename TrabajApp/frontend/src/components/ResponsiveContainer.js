import React from "react";
import { View, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import {
  LAYOUT,
  COLORS,
  useDeviceInfo,
  getResponsiveSize,
} from "../config/theme";

const ResponsiveContainer = ({
  children,
  style,
  contentContainerStyle,
  scrollable = true,
  centered = false,
  safeArea = true,
  maxWidth,
  padding,
  backgroundColor = COLORS.background,
  ...props
}) => {
  const { isPhone, isTablet, isDesktop } = useDeviceInfo();

  // Calcular padding responsivo
  const responsivePadding = padding || getResponsiveSize(16, 24, 32);

  // Calcular ancho máximo responsivo
  const responsiveMaxWidth =
    maxWidth || getResponsiveSize("100%", isTablet ? "90%" : "100%", 1200);

  const containerStyle = [
    styles.container,
    {
      backgroundColor,
      paddingHorizontal: responsivePadding,
      maxWidth: responsiveMaxWidth,
      alignSelf: centered ? "center" : "stretch",
    },
    style,
  ];

  const Container = safeArea ? SafeAreaView : View;
  const Content = scrollable ? ScrollView : View;

  return (
    <Container style={[styles.safeArea, { backgroundColor }]}>
      <Content
        style={scrollable ? undefined : styles.flex}
        contentContainerStyle={[
          scrollable ? styles.scrollContent : styles.flex,
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        <View style={containerStyle}>{children}</View>
      </Content>
    </Container>
  );
};

// Grid Component para layouts responsivos
export const ResponsiveGrid = ({
  children,
  columns,
  gap,
  style,
  itemStyle,
}) => {
  const { isPhone, isTablet, isDesktop } = useDeviceInfo();

  // Determinar número de columnas basado en el dispositivo
  const responsiveColumns = columns || getResponsiveSize(1, 2, 3);
  const responsiveGap = gap || getResponsiveSize(12, 16, 20);

  const gridItems = React.Children.toArray(children);
  const rows = [];

  for (let i = 0; i < gridItems.length; i += responsiveColumns) {
    rows.push(gridItems.slice(i, i + responsiveColumns));
  }

  return (
    <View style={[styles.grid, { gap: responsiveGap }, style]}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.gridRow, { gap: responsiveGap }]}>
          {row.map((item, itemIndex) => (
            <View
              key={itemIndex}
              style={[
                styles.gridItem,
                {
                  flex: 1,
                  maxWidth: `${100 / responsiveColumns}%`,
                },
                itemStyle,
              ]}
            >
              {item}
            </View>
          ))}
          {/* Rellenar espacios vacíos en la última fila */}
          {row.length < responsiveColumns &&
            Array.from({ length: responsiveColumns - row.length }).map(
              (_, index) => (
                <View key={`empty-${index}`} style={styles.gridItem} />
              )
            )}
        </View>
      ))}
    </View>
  );
};

// Row Component para layouts horizontales responsivos
export const ResponsiveRow = ({
  children,
  align = "center",
  justify = "flex-start",
  wrap = false,
  gap,
  style,
}) => {
  const responsiveGap = gap || getResponsiveSize(8, 12, 16);

  return (
    <View
      style={[
        styles.row,
        {
          alignItems: align,
          justifyContent: justify,
          flexWrap: wrap ? "wrap" : "nowrap",
          gap: responsiveGap,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Column Component para layouts verticales responsivos
export const ResponsiveColumn = ({
  children,
  align = "stretch",
  justify = "flex-start",
  gap,
  style,
}) => {
  const responsiveGap = gap || getResponsiveSize(8, 12, 16);

  return (
    <View
      style={[
        styles.column,
        {
          alignItems: align,
          justifyContent: justify,
          gap: responsiveGap,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Card Component responsivo
export const ResponsiveCard = ({
  children,
  style,
  padding,
  margin,
  elevation = "base",
  ...props
}) => {
  const responsivePadding = padding || getResponsiveSize(16, 20, 24);
  const responsiveMargin = margin || getResponsiveSize(8, 12, 16);

  return (
    <View
      style={[
        styles.card,
        {
          padding: responsivePadding,
          margin: responsiveMargin,
          ...getShadowStyle(elevation),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

// Función helper para obtener estilos de sombra
const getShadowStyle = (elevation) => {
  const shadows = {
    none: {
      shadowColor: "transparent",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    base: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
  };

  return shadows[elevation] || shadows.base;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  grid: {
    width: "100%",
  },
  gridRow: {
    flexDirection: "row",
    width: "100%",
  },
  gridItem: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    width: "100%",
  },
  column: {
    flexDirection: "column",
    width: "100%",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ResponsiveContainer;
