const express = require("express");
const Joi = require("joi");
const db = require("../database/connection");
const { asyncHandler, createError } = require("../middleware/errorHandler");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

// GET /api/v1/services/categories - Obtener todas las categorías de servicios
router.get(
  "/categories",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const categories = await db("service_categories")
      .select("id", "name", "slug", "description", "icon_url", "color_hex")
      .where("is_active", true)
      .orderBy("sort_order", "asc");

    // Obtener conteo de servicios por categoría
    const serviceCounts = await db("services as s")
      .join("service_categories as sc", "s.category_id", "sc.id")
      .select("sc.id as category_id")
      .count("s.id as service_count")
      .where("s.is_active", true)
      .where("sc.is_active", true)
      .groupBy("sc.id");

    const countByCategory = serviceCounts.reduce((acc, item) => {
      acc[item.category_id] = parseInt(item.service_count);
      return acc;
    }, {});

    // Obtener conteo de profesionales por categoría
    const professionalCounts = await db("professional_services as ps")
      .join("services as s", "ps.service_id", "s.id")
      .join("service_categories as sc", "s.category_id", "sc.id")
      .join("professional_profiles as pp", "ps.professional_id", "pp.id")
      .join("users as u", "pp.user_id", "u.id")
      .select("sc.id as category_id")
      .countDistinct("u.id as professional_count")
      .where("ps.is_active", true)
      .where("s.is_active", true)
      .where("sc.is_active", true)
      .where("u.is_active", true)
      .where("pp.is_available", true)
      .groupBy("sc.id");

    const professionalCountByCategory = professionalCounts.reduce(
      (acc, item) => {
        acc[item.category_id] = parseInt(item.professional_count);
        return acc;
      },
      {}
    );

    const categoriesWithCounts = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      iconUrl: category.icon_url,
      colorHex: category.color_hex,
      serviceCount: countByCategory[category.id] || 0,
      professionalCount: professionalCountByCategory[category.id] || 0,
    }));

    res.json({
      success: true,
      data: {
        categories: categoriesWithCounts,
        totalCategories: categories.length,
      },
    });
  })
);

// GET /api/v1/services/category/:categoryId - Obtener servicios por categoría
router.get(
  "/category/:categoryId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    // Verificar que la categoría existe
    const category = await db("service_categories")
      .select("id", "name", "slug", "description")
      .where("id", categoryId)
      .where("is_active", true)
      .first();

    if (!category) {
      throw createError(404, "Categoría no encontrada", "CATEGORY_NOT_FOUND");
    }

    // Obtener servicios de la categoría
    const services = await db("services")
      .select(
        "id",
        "name",
        "slug",
        "description",
        "base_price",
        "price_unit",
        "is_emergency"
      )
      .where("category_id", categoryId)
      .where("is_active", true)
      .orderBy("name", "asc");

    // Obtener conteo de profesionales por servicio
    const professionalCounts = await db("professional_services as ps")
      .join("services as s", "ps.service_id", "s.id")
      .join("professional_profiles as pp", "ps.professional_id", "pp.id")
      .join("users as u", "pp.user_id", "u.id")
      .select("s.id as service_id")
      .countDistinct("u.id as professional_count")
      .where("s.category_id", categoryId)
      .where("ps.is_active", true)
      .where("s.is_active", true)
      .where("u.is_active", true)
      .where("pp.is_available", true)
      .groupBy("s.id");

    const professionalCountByService = professionalCounts.reduce(
      (acc, item) => {
        acc[item.service_id] = parseInt(item.professional_count);
        return acc;
      },
      {}
    );

    // Obtener rangos de precios por servicio
    const priceRanges = await db("professional_services as ps")
      .join("services as s", "ps.service_id", "s.id")
      .select(
        "s.id as service_id",
        db.raw("MIN(ps.custom_price) as min_price"),
        db.raw("MAX(ps.custom_price) as max_price"),
        db.raw("AVG(ps.custom_price) as avg_price")
      )
      .where("s.category_id", categoryId)
      .where("ps.is_active", true)
      .where("s.is_active", true)
      .groupBy("s.id");

    const priceRangeByService = priceRanges.reduce((acc, item) => {
      acc[item.service_id] = {
        minPrice: parseFloat(item.min_price) || 0,
        maxPrice: parseFloat(item.max_price) || 0,
        avgPrice: parseFloat(item.avg_price) || 0,
      };
      return acc;
    }, {});

    const servicesWithData = services.map((service) => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
      description: service.description,
      basePrice: parseFloat(service.base_price) || 0,
      priceUnit: service.price_unit,
      isEmergency: service.is_emergency,
      professionalCount: professionalCountByService[service.id] || 0,
      priceRange: priceRangeByService[service.id] || {
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
      },
    }));

    res.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
        },
        services: servicesWithData,
        totalServices: services.length,
      },
    });
  })
);

// GET /api/v1/services/:serviceId - Obtener detalles de un servicio específico
router.get(
  "/:serviceId",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    // Obtener servicio con categoría
    const service = await db("services as s")
      .join("service_categories as sc", "s.category_id", "sc.id")
      .select(
        "s.id",
        "s.name",
        "s.slug",
        "s.description",
        "s.base_price",
        "s.price_unit",
        "s.is_emergency",
        "sc.id as category_id",
        "sc.name as category_name",
        "sc.slug as category_slug"
      )
      .where("s.id", serviceId)
      .where("s.is_active", true)
      .where("sc.is_active", true)

      .first();
  })
);
