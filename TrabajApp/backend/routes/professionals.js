const express = require("express");
const Joi = require("joi");
const db = require("../database/connection");
const { asyncHandler, createError } = require("../middleware/errorHandler");
const { requireProfessional } = require("../middleware/auth");

const router = express.Router();

// Esquemas de validación
const updateProfessionalSchema = Joi.object({
  bio: Joi.string().max(500).optional(),
  experienceYears: Joi.number().min(0).max(50).optional(),
  hourlyRate: Joi.number().min(0).max(100000).optional(),
  workRadiusKm: Joi.number().min(1).max(100).optional(),
  acceptsEmergencies: Joi.boolean().optional(),
  emergencyRateMultiplier: Joi.number().min(1).max(5).optional(),
  hasVehicle: Joi.boolean().optional(),
  hasTools: Joi.boolean().optional(),
  workSchedule: Joi.object().optional(),
});

const searchProfessionalsSchema = Joi.object({
  serviceId: Joi.string().uuid().optional(),
  categoryId: Joi.string().uuid().optional(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radiusKm: Joi.number().min(1).max(50).default(10),
  minRating: Joi.number().min(1).max(5).optional(),
  maxPrice: Joi.number().min(0).optional(),
  availableNow: Joi.boolean().default(false),
  emergencyOnly: Joi.boolean().default(false),
  verifiedOnly: Joi.boolean().default(false),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(20),
});

const addServiceSchema = Joi.object({
  serviceId: Joi.string().uuid().required(),
  customPrice: Joi.number().min(0).required(),
  priceUnit: Joi.string()
    .valid("servicio", "hora", "m2", "metro", "punto")
    .default("servicio"),
  description: Joi.string().max(300).optional(),
});

const addPortfolioSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().max(300).optional(),
  serviceId: Joi.string().uuid().optional(),
  completedDate: Joi.date().optional(),
  isFeatured: Joi.boolean().default(false),
});

// GET /api/v1/professionals/search - Buscar profesionales
router.get(
  "/search",
  asyncHandler(async (req, res) => {
    const { error, value } = searchProfessionalsSchema.validate(req.query);

    if (error) {
      throw createError(400, error.details[0].message, "VALIDATION_ERROR");
    }

    const {
      serviceId,
      categoryId,
      latitude,
      longitude,
      radiusKm,
      minRating,
      maxPrice,
      availableNow,
      emergencyOnly,
      verifiedOnly,
      page,
      limit,
    } = value;

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Construir query base
    let query = db("users as u")
      .join("professional_profiles as pp", "u.id", "pp.user_id")
      .leftJoin("professional_services as ps", "pp.id", "ps.professional_id")
      .leftJoin("services as s", "ps.service_id", "s.id")
      .leftJoin("service_categories as sc", "s.category_id", "sc.id")
      .select(
        "u.id",
        "u.first_name",
        "u.last_name",
        "u.profile_image_url",
        "u.city",
        "u.rating_avg",
        "u.rating_count",
        "u.latitude",
        "u.longitude",
        "pp.bio",
        "pp.experience_years",
        "pp.hourly_rate",
        "pp.work_radius_km",
        "pp.accepts_emergencies",
        "pp.has_vehicle",
        "pp.has_tools",
        "pp.verification_status",
        "pp.is_available",
        "pp.subscription_type",
        // Calcular distancia usando fórmula haversine
        db.raw(
          `
        (6371 * acos(
          cos(radians(?)) * cos(radians(u.latitude)) * 
          cos(radians(u.longitude) - radians(?)) + 
          sin(radians(?)) * sin(radians(u.latitude))
        )) as distance_km
      `,
          [latitude, longitude, latitude]
        )
      )
      .where("u.user_type", "professional")
      .where("u.is_active", true)
      .where("pp.is_available", true)
      .whereRaw("u.latitude IS NOT NULL AND u.longitude IS NOT NULL")
      .havingRaw("distance_km <= ?", [radiusKm]);

    // Aplicar filtros opcionales
    if (serviceId) {
      query = query
        .where("ps.service_id", serviceId)
        .where("ps.is_active", true);
    }

    if (categoryId) {
      query = query.where("sc.id", categoryId);
    }

    if (minRating) {
      query = query.where("u.rating_avg", ">=", minRating);
    }

    if (maxPrice) {
      query = query.where("ps.custom_price", "<=", maxPrice);
    }

    if (emergencyOnly) {
      query = query.where("pp.accepts_emergencies", true);
    }

    if (verifiedOnly) {
      query = query.where("pp.verification_status", "verified");
    }

    // Filtro de disponibilidad actual (implementación básica)
    if (availableNow) {
      const currentHour = new Date().getHours();
      const currentDay = new Date().getDay(); // 0 = domingo, 1 = lunes, etc.
      // Aquí se podría implementar lógica más compleja basada en work_schedule
      query = query.where("pp.is_available", true);
    }

    // Ejecutar query con paginación
    const professionals = await query
      .groupBy("u.id", "pp.id")
      .orderBy([
        { column: "pp.subscription_type", order: "desc" }, // Premium primero
        { column: "u.rating_avg", order: "desc" },
        { column: "distance_km", order: "asc" },
      ])
      .limit(limit)
      .offset(offset);

    // Obtener servicios para cada profesional
    const professionalIds = professionals.map((p) => p.id);

    const services = await db("professional_services as ps")
      .join("services as s", "ps.service_id", "s.id")
      .join("service_categories as sc", "s.category_id", "sc.id")
      .join("professional_profiles as pp", "ps.professional_id", "pp.id")
      .select(
        "pp.user_id",
        "s.name as service_name",
        "sc.name as category_name",
        "ps.custom_price",
        "ps.price_unit",
        "ps.description as service_description"
      )
      .whereIn("pp.user_id", professionalIds)
      .where("ps.is_active", true);

    // Agrupar servicios por profesional
    const servicesByProfessional = services.reduce((acc, service) => {
      if (!acc[service.user_id]) {
        acc[service.user_id] = [];
      }
      acc[service.user_id].push({
        name: service.service_name,
        category: service.category_name,
        price: parseFloat(service.custom_price),
        priceUnit: service.price_unit,
        description: service.service_description,
      });
      return acc;
    }, {});

    // Formatear resultados
    const formattedProfessionals = professionals.map((prof) => ({
      id: prof.id,
      firstName: prof.first_name,
      lastName: prof.last_name,
      profileImage: prof.profile_image_url,
      city: prof.city,
      rating: parseFloat(prof.rating_avg) || 0,
      ratingCount: prof.rating_count || 0,
      distance: Math.round(parseFloat(prof.distance_km) * 10) / 10, // Redondear a 1 decimal
      bio: prof.bio,
      experienceYears: prof.experience_years,
      baseRate: parseFloat(prof.hourly_rate),
      workRadius: prof.work_radius_km,
      acceptsEmergencies: prof.accepts_emergencies,
      hasVehicle: prof.has_vehicle,
      hasTools: prof.has_tools,
      isVerified: prof.verification_status === "verified",
      isPremium: prof.subscription_type === "premium",
      services: servicesByProfessional[prof.id] || [],
    }));

    // Contar total para paginación
    const totalQuery = db("users as u")
      .join("professional_profiles as pp", "u.id", "pp.user_id")
      .where("u.user_type", "professional")
      .where("u.is_active", true)
      .where("pp.is_available", true)
      .whereRaw("u.latitude IS NOT NULL AND u.longitude IS NOT NULL")
      .whereRaw(
        `
      (6371 * acos(
        cos(radians(?)) * cos(radians(u.latitude)) * 
        cos(radians(u.longitude) - radians(?)) + 
        sin(radians(?)) * sin(radians(u.latitude))
      )) <= ?
    `,
        [latitude, longitude, latitude, radiusKm]
      );

    if (serviceId) {
      totalQuery
        .join("professional_services as ps", "pp.id", "ps.professional_id")
        .where("ps.service_id", serviceId)
        .where("ps.is_active", true);
    }

    const [{ count }] = await totalQuery.count("u.id as count");
    const totalProfessionals = parseInt(count);

    res.json({
      success: true,
      data: {
        professionals: formattedProfessionals,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalProfessionals / limit),
          totalProfessionals,
          limit,
          hasNext: page < Math.ceil(totalProfessionals / limit),
          hasPrev: page > 1,
        },
        searchParams: {
          latitude,
          longitude,
          radiusKm,
          serviceId,
          categoryId,
        },
      },
    });
  })
);

// PUT /api/v1/professionals/profile - Actualizar perfil profesional
router.put(
  "/profile",
  requireProfessional,
  asyncHandler(async (req, res) => {
    const { error, value } = updateProfessionalSchema.validate(req.body);

    if (error) {
      throw createError(400, error.details[0].message, "VALIDATION_ERROR");
    }

    const updateData = {};

    if (value.bio !== undefined) updateData.bio = value.bio;
    if (value.experienceYears !== undefined)
      updateData.experience_years = value.experienceYears;
    if (value.hourlyRate !== undefined)
      updateData.hourly_rate = value.hourlyRate;
    if (value.workRadiusKm !== undefined)
      updateData.work_radius_km = value.workRadiusKm;
    if (value.acceptsEmergencies !== undefined)
      updateData.accepts_emergencies = value.acceptsEmergencies;
    if (value.emergencyRateMultiplier !== undefined)
      updateData.emergency_rate_multiplier = value.emergencyRateMultiplier;
    if (value.hasVehicle !== undefined)
      updateData.has_vehicle = value.hasVehicle;
    if (value.hasTools !== undefined) updateData.has_tools = value.hasTools;
    if (value.workSchedule !== undefined)
      updateData.work_schedule = JSON.stringify(value.workSchedule);

    updateData.updated_at = db.fn.now();

    await db("professional_profiles")
      .where("user_id", req.userId)
      .update(updateData);

    res.json({
      success: true,
      message: "Perfil profesional actualizado exitosamente",
    });
  })
);

// POST /api/v1/professionals/services - Agregar servicio
router.post(
  "/services",
  requireProfessional,
  asyncHandler(async (req, res) => {
    const { error, value } = addServiceSchema.validate(req.body);

    if (error) {
      throw createError(400, error.details[0].message, "VALIDATION_ERROR");
    }

    // Obtener ID del perfil profesional
    const profile = await db("professional_profiles")
      .select("id")
      .where("user_id", req.userId)
      .first();

    if (!profile) {
      throw createError(
        404,
        "Perfil profesional no encontrado",
        "PROFILE_NOT_FOUND"
      );
    }

    // Verificar que el servicio existe
    const service = await db("services")
      .select("id", "name")
      .where("id", value.serviceId)
      .where("is_active", true)
      .first();

    if (!service) {
      throw createError(404, "Servicio no encontrado", "SERVICE_NOT_FOUND");
    }

    // Verificar que no esté ya agregado
    const existingService = await db("professional_services")
      .where("professional_id", profile.id)
      .where("service_id", value.serviceId)
      .first();

    if (existingService) {
      throw createError(
        409,
        "Ya tienes este servicio agregado",
        "SERVICE_ALREADY_EXISTS"
      );
    }

    // Agregar servicio
    const [newService] = await db("professional_services")
      .insert({
        professional_id: profile.id,
        service_id: value.serviceId,
        custom_price: value.customPrice,
        price_unit: value.priceUnit,
        description: value.description,
      })
      .returning([
        "id",
        "custom_price",
        "price_unit",
        "description",
        "created_at",
      ]);

    res.status(201).json({
      success: true,
      message: "Servicio agregado exitosamente",
      data: {
        service: {
          id: newService.id,
          serviceName: service.name,
          customPrice: parseFloat(newService.custom_price),
          priceUnit: newService.price_unit,
          description: newService.description,
          createdAt: newService.created_at,
        },
      },
    });
  })
);

// DELETE /api/v1/professionals/services/:serviceId - Remover servicio
router.delete(
  "/services/:serviceId",
  requireProfessional,
  asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    const profile = await db("professional_profiles")
      .select("id")
      .where("user_id", req.userId)
      .first();

    if (!profile) {
      throw createError(
        404,
        "Perfil profesional no encontrado",
        "PROFILE_NOT_FOUND"
      );
    }

    const deletedRows = await db("professional_services")
      .where("professional_id", profile.id)
      .where("service_id", serviceId)
      .del();

    if (deletedRows === 0) {
      throw createError(
        404,
        "Servicio no encontrado en tu perfil",
        "SERVICE_NOT_FOUND"
      );
    }

    res.json({
      success: true,
      message: "Servicio removido exitosamente",
    });
  })
);

// POST /api/v1/professionals/portfolio - Agregar trabajo al portfolio
router.post(
  "/portfolio",
  requireProfessional,
  asyncHandler(async (req, res) => {
    const { error, value } = addPortfolioSchema.validate(req.body);

    if (error) {
      throw createError(400, error.details[0].message, "VALIDATION_ERROR");
    }

    const profile = await db("professional_profiles")
      .select("id")
      .where("user_id", req.userId)
      .first();

    if (!profile) {
      throw createError(
        404,
        "Perfil profesional no encontrado",
        "PROFILE_NOT_FOUND"
      );
    }

    // Verificar límite de trabajos destacados (máximo 3)
    if (value.isFeatured) {
      const featuredCount = await db("professional_portfolio")
        .where("professional_id", profile.id)
        .where("is_featured", true)
        .count("id as count")
        .first();

      if (parseInt(featuredCount.count) >= 3) {
        throw createError(
          400,
          "Ya tienes el máximo de trabajos destacados (3)",
          "MAX_FEATURED_REACHED"
        );
      }
    }

    const [portfolioItem] = await db("professional_portfolio")
      .insert({
        professional_id: profile.id,
        title: value.title,
        description: value.description,
        service_id: value.serviceId,
        completed_date: value.completedDate,
        is_featured: value.isFeatured,
      })
      .returning([
        "id",
        "title",
        "description",
        "completed_date",
        "is_featured",
        "created_at",
      ]);

    res.status(201).json({
      success: true,
      message: "Trabajo agregado al portfolio exitosamente",
      data: {
        portfolioItem: {
          id: portfolioItem.id,
          title: portfolioItem.title,
          description: portfolioItem.description,
          completedDate: portfolioItem.completed_date,
          isFeatured: portfolioItem.is_featured,
          createdAt: portfolioItem.created_at,
        },
      },
    });
  })
);

// PUT /api/v1/professionals/availability - Cambiar disponibilidad
router.put(
  "/availability",
  requireProfessional,
  asyncHandler(async (req, res) => {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      throw createError(
        400,
        "isAvailable debe ser true o false",
        "INVALID_AVAILABILITY"
      );
    }

    await db("professional_profiles").where("user_id", req.userId).update({
      is_available: isAvailable,
      updated_at: db.fn.now(),
    });

    res.json({
      success: true,
      message: `Disponibilidad ${
        isAvailable ? "activada" : "desactivada"
      } exitosamente`,
      data: { isAvailable },
    });
  })
);

// GET /api/v1/professionals/stats - Estadísticas del profesional
router.get(
  "/stats",
  requireProfessional,
  asyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Obtener estadísticas
    const [
      totalJobs,
      completedJobs,
      activeQuotations,
      totalEarnings,
      avgRating,
      recentJobs,
    ] = await Promise.all([
      // Total de trabajos
      db("jobs")
        .where("professional_id", req.userId)
        .count("id as count")
        .first(),

      // Trabajos completados
      db("jobs")
        .where("professional_id", req.userId)
        .where("status", "delivered")
        .count("id as count")
        .first(),

      // Cotizaciones activas
      db("quotations")
        .where("professional_id", req.userId)
        .where("status", "pending")
        .count("id as count")
        .first(),

      // Ganancias totales (últimos 30 días)
      db("payments as p")
        .join("jobs as j", "p.job_id", "j.id")
        .where("j.professional_id", req.userId)
        .where("p.status", "completed")
        .where("p.created_at", ">=", thirtyDaysAgo)
        .sum("p.professional_amount as total")
        .first(),

      // Rating promedio
      db("reviews")
        .where("reviewee_id", req.userId)
        .where("reviewer_type", "client")
        .avg("rating as avg")
        .first(),

      // Trabajos recientes
      db("jobs as j")
        .join("services as s", "j.service_id", "s.id")
        .join("users as u", "j.client_id", "u.id")
        .select(
          "j.id",
          "j.title",
          "j.status",
          "j.final_price",
          "j.created_at",
          "s.name as service_name",
          "u.first_name as client_first_name"
        )
        .where("j.professional_id", req.userId)
        .orderBy("j.created_at", "desc")
        .limit(5),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalJobs: parseInt(totalJobs.count) || 0,
          completedJobs: parseInt(completedJobs.count) || 0,
          activeQuotations: parseInt(activeQuotations.count) || 0,
          totalEarnings: parseFloat(totalEarnings.total) || 0,
          avgRating: parseFloat(avgRating.avg) || 0,
          successRate:
            parseInt(totalJobs.count) > 0
              ? Math.round(
                  (parseInt(completedJobs.count) / parseInt(totalJobs.count)) *
                    100
                )
              : 0,
        },
        recentJobs: recentJobs.map((job) => ({
          id: job.id,
          title: job.title,
          status: job.status,
          price: parseFloat(job.final_price),
          serviceName: job.service_name,
          clientName: job.client_first_name,
          createdAt: job.created_at,
        })),
      },
    });
  })
);

module.exports = router;
