const express = require("express");
const Joi = require("joi");
const db = require("../database/connection");
const { asyncHandler, createError } = require("../middleware/errorHandler");

const router = express.Router();

// Esquemas de validación
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

const updateSettingsSchema = Joi.object({
  emailNotifications: Joi.boolean().optional(),
  pushNotifications: Joi.boolean().optional(),
  smsNotifications: Joi.boolean().optional(),
  notifyNewQuotations: Joi.boolean().optional(),
  notifyJobUpdates: Joi.boolean().optional(),
  notifyMessages: Joi.boolean().optional(),
  notifyPayments: Joi.boolean().optional(),
  notifyReviews: Joi.boolean().optional(),
  notifyPromotions: Joi.boolean().optional(),
  profilePublic: Joi.boolean().optional(),
  showPhone: Joi.boolean().optional(),
  showEmail: Joi.boolean().optional(),
  showLastActivity: Joi.boolean().optional(),
});

// GET /api/v1/users/me - Obtener perfil del usuario actual
router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await db("users")
      .select(
        "id",
        "email",
        "first_name",
        "last_name",
        "phone",
        "user_type",
        "profile_image_url",
        "address",
        "latitude",
        "longitude",
        "city",
        "province",
        "country",
        "is_verified",
        "rating_avg",
        "rating_count",
        "created_at",
        "last_login"
      )
      .where("id", req.userId)
      .first();

    if (!user) {
      throw createError(404, "Usuario no encontrado", "USER_NOT_FOUND");
    }

    // Si es profesional, obtener datos adicionales
    let professionalProfile = null;
    if (user.user_type === "professional") {
      professionalProfile = await db("professional_profiles")
        .select(
          "bio",
          "experience_years",
          "hourly_rate",
          "work_radius_km",
          "accepts_emergencies",
          "emergency_rate_multiplier",
          "has_vehicle",
          "has_tools",
          "verification_status",
          "is_available",
          "subscription_type",
          "subscription_expires_at"
        )
        .where("user_id", user.id)
        .first();

      // Obtener servicios del profesional
      if (professionalProfile) {
        const services = await db("professional_services as ps")
          .join("services as s", "ps.service_id", "s.id")
          .join("service_categories as sc", "s.category_id", "sc.id")
          .select(
            "ps.id",
            "s.name as service_name",
            "sc.name as category_name",
            "ps.custom_price",
            "ps.price_unit",
            "ps.description",
            "ps.is_active"
          )
          .where("ps.professional_id", professionalProfile.id)
          .where("ps.is_active", true);

        professionalProfile.services = services;

        // Obtener portfolio
        const portfolio = await db("professional_portfolio")
          .select(
            "id",
            "title",
            "description",
            "image_url",
            "completed_date",
            "is_featured"
          )
          .where("professional_id", professionalProfile.id)
          .orderBy([
            { column: "is_featured", order: "desc" },
            { column: "sort_order", order: "asc" },
            { column: "created_at", order: "desc" },
          ]);

        professionalProfile.portfolio = portfolio;
      }
    }

    // Obtener configuraciones del usuario
    const settings = await db("user_settings")
      .select("*")
      .where("user_id", user.id)
      .first();

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          userType: user.user_type,
          profileImage: user.profile_image_url,
          address: user.address,
          latitude: user.latitude,
          longitude: user.longitude,
          city: user.city,
          province: user.province,
          country: user.country,
          isVerified: user.is_verified,
          ratingAvg: parseFloat(user.rating_avg) || 0,
          ratingCount: user.rating_count || 0,
          createdAt: user.created_at,
          lastLogin: user.last_login,
        },
        professionalProfile,
        settings: settings
          ? {
              emailNotifications: settings.email_notifications,
              pushNotifications: settings.push_notifications,
              smsNotifications: settings.sms_notifications,
              notifyNewQuotations: settings.notify_new_quotations,
              notifyJobUpdates: settings.notify_job_updates,
              notifyMessages: settings.notify_messages,
              notifyPayments: settings.notify_payments,
              notifyReviews: settings.notify_reviews,
              notifyPromotions: settings.notify_promotions,
              profilePublic: settings.profile_public,
              showPhone: settings.show_phone,
              showEmail: settings.show_email,
              showLastActivity: settings.show_last_activity,
            }
          : null,
      },
    });
  })
);

// PUT /api/v1/users/me - Actualizar perfil del usuario
router.put(
  "/me",
  asyncHandler(async (req, res) => {
    const { error, value } = updateProfileSchema.validate(req.body);

    if (error) {
      throw createError(400, error.details[0].message, "VALIDATION_ERROR");
    }

    const updateData = {};

    if (value.firstName) updateData.first_name = value.firstName;
    if (value.lastName) updateData.last_name = value.lastName;
    if (value.phone) updateData.phone = value.phone;
    if (value.address) updateData.address = value.address;
    if (value.city) updateData.city = value.city;
    if (value.latitude !== undefined) updateData.latitude = value.latitude;
    if (value.longitude !== undefined) updateData.longitude = value.longitude;

    updateData.updated_at = db.fn.now();

    const [updatedUser] = await db("users")
      .where("id", req.userId)
      .update(updateData)
      .returning([
        "id",
        "email",
        "first_name",
        "last_name",
        "phone",
        "address",
        "city",
        "latitude",
        "longitude",
        "updated_at",
      ]);

    if (!updatedUser) {
      throw createError(404, "Usuario no encontrado", "USER_NOT_FOUND");
    }

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          phone: updatedUser.phone,
          address: updatedUser.address,
          city: updatedUser.city,
          latitude: updatedUser.latitude,
          longitude: updatedUser.longitude,
          updatedAt: updatedUser.updated_at,
        },
      },
    });
  })
);

// PUT /api/v1/users/settings - Actualizar configuraciones del usuario
router.put(
  "/settings",
  asyncHandler(async (req, res) => {
    const { error, value } = updateSettingsSchema.validate(req.body);

    if (error) {
      throw createError(400, error.details[0].message, "VALIDATION_ERROR");
    }

    const updateData = {};

    if (value.emailNotifications !== undefined)
      updateData.email_notifications = value.emailNotifications;
    if (value.pushNotifications !== undefined)
      updateData.push_notifications = value.pushNotifications;
    if (value.smsNotifications !== undefined)
      updateData.sms_notifications = value.smsNotifications;
    if (value.notifyNewQuotations !== undefined)
      updateData.notify_new_quotations = value.notifyNewQuotations;
    if (value.notifyJobUpdates !== undefined)
      updateData.notify_job_updates = value.notifyJobUpdates;
    if (value.notifyMessages !== undefined)
      updateData.notify_messages = value.notifyMessages;
    if (value.notifyPayments !== undefined)
      updateData.notify_payments = value.notifyPayments;
    if (value.notifyReviews !== undefined)
      updateData.notify_reviews = value.notifyReviews;
    if (value.notifyPromotions !== undefined)
      updateData.notify_promotions = value.notifyPromotions;
    if (value.profilePublic !== undefined)
      updateData.profile_public = value.profilePublic;
    if (value.showPhone !== undefined) updateData.show_phone = value.showPhone;
    if (value.showEmail !== undefined) updateData.show_email = value.showEmail;
    if (value.showLastActivity !== undefined)
      updateData.show_last_activity = value.showLastActivity;

    updateData.updated_at = db.fn.now();

    await db("user_settings").where("user_id", req.userId).update(updateData);

    res.json({
      success: true,
      message: "Configuraciones actualizadas exitosamente",
    });
  })
);

// GET /api/v1/users/:id - Obtener perfil público de un usuario
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Verificar que el ID sea válido
    if (!id || id.length !== 36) {
      throw createError(400, "ID de usuario inválido", "INVALID_USER_ID");
    }

    const user = await db("users")
      .select(
        "id",
        "first_name",
        "last_name",
        "user_type",
        "profile_image_url",
        "city",
        "is_verified",
        "rating_avg",
        "rating_count",
        "created_at"
      )
      .where("id", id)
      .where("is_active", true)
      .first();

    if (!user) {
      throw createError(404, "Usuario no encontrado", "USER_NOT_FOUND");
    }

    // Verificar configuraciones de privacidad
    const settings = await db("user_settings")
      .select(
        "profile_public",
        "show_phone",
        "show_email",
        "show_last_activity"
      )
      .where("user_id", id)
      .first();

    if (settings && !settings.profile_public && req.userId !== id) {
      throw createError(403, "Perfil privado", "PRIVATE_PROFILE");
    }

    let publicProfile = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      userType: user.user_type,
      profileImage: user.profile_image_url,
      city: user.city,
      isVerified: user.is_verified,
      ratingAvg: parseFloat(user.rating_avg) || 0,
      ratingCount: user.rating_count || 0,
      memberSince: user.created_at,
    };

    // Si es profesional, obtener datos adicionales
    if (user.user_type === "professional") {
      const professionalProfile = await db("professional_profiles")
        .select(
          "bio",
          "experience_years",
          "work_radius_km",
          "accepts_emergencies",
          "has_vehicle",
          "has_tools",
          "verification_status"
        )
        .where("user_id", id)
        .first();

      if (professionalProfile) {
        // Obtener servicios
        const services = await db("professional_services as ps")
          .join("services as s", "ps.service_id", "s.id")
          .join("service_categories as sc", "s.category_id", "sc.id")
          .select(
            "s.name as service_name",
            "sc.name as category_name",
            "ps.custom_price",
            "ps.price_unit",
            "ps.description"
          )
          .where("ps.professional_id", professionalProfile.id)
          .where("ps.is_active", true);

        // Obtener portfolio
        const portfolio = await db("professional_portfolio")
          .select(
            "id",
            "title",
            "description",
            "image_url",
            "completed_date",
            "is_featured"
          )
          .where("professional_id", professionalProfile.id)
          .orderBy([
            { column: "is_featured", order: "desc" },
            { column: "sort_order", order: "asc" },
          ])
          .limit(10);

        // Obtener reseñas recientes
        const reviews = await db("reviews as r")
          .join("users as u", "r.reviewer_id", "u.id")
          .join("jobs as j", "r.job_id", "j.id")
          .join("services as s", "j.service_id", "s.id")
          .select(
            "r.id",
            "r.rating",
            "r.comment",
            "r.created_at",
            "u.first_name as reviewer_first_name",
            "u.last_name as reviewer_last_name",
            "s.name as service_name"
          )
          .where("r.reviewee_id", id)
          .where("r.is_public", true)
          .where("r.moderation_status", "approved")
          .orderBy("r.created_at", "desc")
          .limit(5);

        publicProfile.professionalProfile = {
          bio: professionalProfile.bio,
          experienceYears: professionalProfile.experience_years,
          workRadiusKm: professionalProfile.work_radius_km,
          acceptsEmergencies: professionalProfile.accepts_emergencies,
          hasVehicle: professionalProfile.has_vehicle,
          hasTools: professionalProfile.has_tools,
          isVerified: professionalProfile.verification_status === "verified",
          services,
          portfolio,
          reviews: reviews.map((review) => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.created_at,
            reviewerName: `${
              review.reviewer_first_name
            } ${review.reviewer_last_name.charAt(0)}.`,
            serviceName: review.service_name,
          })),
        };
      }
    }

    res.json({
      success: true,
      data: { user: publicProfile },
    });
  })
);

// DELETE /api/v1/users/me - Eliminar cuenta del usuario
router.delete(
  "/me",
  asyncHandler(async (req, res) => {
    // En lugar de eliminar, desactivar la cuenta
    await db("users")
      .where("id", req.userId)
      .update({
        is_active: false,
        email: `deleted_${Date.now()}_${req.userId}@trabajapp.com`,
        phone: null,
        updated_at: db.fn.now(),
      });

    res.json({
      success: true,
      message: "Cuenta desactivada exitosamente",
    });
  })
);

module.exports = router;
