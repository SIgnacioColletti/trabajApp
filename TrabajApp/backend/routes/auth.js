const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const db = require("../database/connection");
const { asyncHandler, createError } = require("../middleware/errorHandler");
const {
  sendVerificationEmail,
  sendVerificationSMS,
} = require("../utils/notifications");

const router = express.Router();

// Esquemas de validación
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "El email debe tener un formato válido",
    "any.required": "El email es obligatorio",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "La contraseña debe tener al menos 6 caracteres",
    "any.required": "La contraseña es obligatoria",
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    "string.min": "El nombre debe tener al menos 2 caracteres",
    "string.max": "El nombre no puede exceder 50 caracteres",
    "any.required": "El nombre es obligatorio",
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    "string.min": "El apellido debe tener al menos 2 caracteres",
    "string.max": "El apellido no puede exceder 50 caracteres",
    "any.required": "El apellido es obligatorio",
  }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base": "El teléfono debe tener un formato válido",
      "any.required": "El teléfono es obligatorio",
    }),
  userType: Joi.string().valid("client", "professional").required().messages({
    "any.only": "El tipo de usuario debe ser client o professional",
    "any.required": "El tipo de usuario es obligatorio",
  }),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(50).default("Rosario"),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

// POST /api/v1/auth/register - Registro de usuario
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    // Validar datos de entrada
    const { error, value } = registerSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
        message: error.details[0].message,
        code: "VALIDATION_ERROR",
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      userType,
      address,
      city,
      latitude,
      longitude,
    } = value;

    // Verificar si el usuario ya existe
    const existingUser = await db("users")
      .where("email", email)
      .orWhere("phone", phone)
      .first();

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "teléfono";
      throw createError(
        409,
        `Ya existe un usuario con ese ${field}`,
        "USER_EXISTS"
      );
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generar token de verificación
    const verificationToken = jwt.sign(
      { email, timestamp: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Crear usuario en la base de datos
    const [newUser] = await db("users")
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        phone,
        user_type: userType,
        address,
        city,
        latitude,
        longitude,
        verification_token: verificationToken,
        is_active: true,
        is_verified: false,
      })
      .returning([
        "id",
        "email",
        "first_name",
        "last_name",
        "phone",
        "user_type",
        "city",
        "is_verified",
        "created_at",
      ]);

    // Crear perfil de profesional si corresponde
    if (userType === "professional") {
      await db("professional_profiles").insert({
        user_id: newUser.id,
        bio: "",
        experience_years: 0,
        hourly_rate: 0,
        work_radius_km: 10,
        accepts_emergencies: false,
        verification_status: "pending",
      });
    }

    // Crear configuraciones por defecto
    await db("user_settings").insert({
      user_id: newUser.id,
    });

    // Enviar email de verificación
    try {
      await sendVerificationEmail(email, verificationToken, firstName);
    } catch (emailError) {
      console.error("Error enviando email de verificación:", emailError);
      // No fallar el registro por esto
    }

    // Generar JWT para login automático
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        type: newUser.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.first_name,
          lastName: newUser.last_name,
          phone: newUser.phone,
          userType: newUser.user_type,
          city: newUser.city,
          isVerified: newUser.is_verified,
          createdAt: newUser.created_at,
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
    });
  })
);

// POST /api/v1/auth/login - Iniciar sesión
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    // Validar datos de entrada
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
        message: error.details[0].message,
        code: "VALIDATION_ERROR",
      });
    }

    const { email, password } = value;

    // Buscar usuario por email
    const user = await db("users")
      .select(
        "id",
        "email",
        "password_hash",
        "first_name",
        "last_name",
        "phone",
        "user_type",
        "profile_image_url",
        "city",
        "is_active",
        "is_verified"
      )
      .where("email", email)
      .first();

    if (!user) {
      throw createError(
        401,
        "Email o contraseña incorrectos",
        "INVALID_CREDENTIALS"
      );
    }

    if (!user.is_active) {
      throw createError(
        401,
        "Tu cuenta ha sido desactivada. Contacta soporte.",
        "ACCOUNT_INACTIVE"
      );
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw createError(
        401,
        "Email o contraseña incorrectos",
        "INVALID_CREDENTIALS"
      );
    }

    // Actualizar última fecha de login
    await db("users").where("id", user.id).update({ last_login: db.fn.now() });

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: user.user_type,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      success: true,
      message: "Inicio de sesión exitoso",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          phone: user.phone,
          userType: user.user_type,
          profileImage: user.profile_image_url,
          city: user.city,
          isVerified: user.is_verified,
        },
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      },
    });
  })
);

// POST /api/v1/auth/verify-email - Verificar email
router.post(
  "/verify-email",
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      throw createError(
        400,
        "Token de verificación requerido",
        "TOKEN_REQUIRED"
      );
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await db("users").where("verification_token", token).first();

      if (!user) {
        throw createError(
          400,
          "Token de verificación inválido",
          "INVALID_TOKEN"
        );
      }

      if (user.is_verified) {
        return res.json({
          success: true,
          message: "Email ya verificado anteriormente",
        });
      }

      // Marcar como verificado
      await db("users").where("id", user.id).update({
        is_verified: true,
        email_verified_at: db.fn.now(),
        verification_token: null,
      });

      res.json({
        success: true,
        message: "Email verificado exitosamente",
      });
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        throw createError(
          400,
          "Token de verificación expirado",
          "TOKEN_EXPIRED"
        );
      }
      throw createError(400, "Token de verificación inválido", "INVALID_TOKEN");
    }
  })
);

// POST /api/v1/auth/resend-verification - Reenviar verificación
router.post(
  "/resend-verification",
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw createError(400, "Email requerido", "EMAIL_REQUIRED");
    }

    const user = await db("users")
      .select("id", "email", "first_name", "is_verified")
      .where("email", email)
      .first();

    if (!user) {
      // Por seguridad, no revelar si el email existe o no
      return res.json({
        success: true,
        message:
          "Si el email existe, se ha enviado un nuevo enlace de verificación",
      });
    }

    if (user.is_verified) {
      return res.json({
        success: true,
        message: "El email ya está verificado",
      });
    }

    // Generar nuevo token
    const verificationToken = jwt.sign(
      { email: user.email, timestamp: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Actualizar token en BD
    await db("users")
      .where("id", user.id)
      .update({ verification_token: verificationToken });

    // Enviar email
    try {
      await sendVerificationEmail(
        user.email,
        verificationToken,
        user.first_name
      );
    } catch (emailError) {
      console.error("Error enviando email:", emailError);
      throw createError(
        500,
        "Error enviando email de verificación",
        "EMAIL_SEND_ERROR"
      );
    }

    res.json({
      success: true,
      message: "Nuevo enlace de verificación enviado",
    });
  })
);

// POST /api/v1/auth/forgot-password - Recuperar contraseña
router.post(
  "/forgot-password",
  asyncHandler(async (req, res) => {
    const { error, value } = forgotPasswordSchema.validate(req.body);

    if (error) {
      throw createError(400, error.details[0].message, "VALIDATION_ERROR");
    }

    const { email } = value;

    const user = await db("users")
      .select("id", "email", "first_name")
      .where("email", email)
      .first();

    if (!user) {
      // Por seguridad, siempre responder exitosamente
      return res.json({
        success: true,
        message: "Si el email existe, se ha enviado un enlace de recuperación",
      });
    }

    // Generar token de reset
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Guardar token en BD
    await db("user_tokens").insert({
      user_id: user.id,
      token_hash: await bcrypt.hash(resetToken, 10),
      token_type: "password_reset",
      expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
    });

    // Enviar email (implementar función)
    // await sendPasswordResetEmail(user.email, resetToken, user.first_name);

    res.json({
      success: true,
      message: "Enlace de recuperación enviado a tu email",
    });
  })
);

// POST /api/v1/auth/reset-password - Resetear contraseña
router.post(
  "/reset-password",
  asyncHandler(async (req, res) => {
    const { error, value } = resetPasswordSchema.validate(req.body);

    if (error) {
      throw createError(400, error.details[0].message, "VALIDATION_ERROR");
    }

    const { token, password } = value;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar token válido en BD
      const tokenRecord = await db("user_tokens")
        .where({
          user_id: decoded.userId,
          token_type: "password_reset",
          is_used: false,
        })
        .where("expires_at", ">", new Date())
        .first();

      if (!tokenRecord) {
        throw createError(400, "Token inválido o expirado", "INVALID_TOKEN");
      }

      // Verificar token hash
      const isTokenValid = await bcrypt.compare(token, tokenRecord.token_hash);
      if (!isTokenValid) {
        throw createError(400, "Token inválido", "INVALID_TOKEN");
      }

      // Hash nueva contraseña
      const passwordHash = await bcrypt.hash(password, 12);

      // Actualizar contraseña
      await db("users")
        .where("id", decoded.userId)
        .update({ password_hash: passwordHash });

      // Marcar token como usado
      await db("user_tokens")
        .where("id", tokenRecord.id)
        .update({ is_used: true });

      res.json({
        success: true,
        message: "Contraseña actualizada exitosamente",
      });
    } catch (jwtError) {
      throw createError(400, "Token inválido o expirado", "INVALID_TOKEN");
    }
  })
);

module.exports = router;
