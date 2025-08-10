const jwt = require("jsonwebtoken");
const db = require("../database/connection");

const authMiddleware = async (req, res, next) => {
  try {
    // Extraer token del header Authorization
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Acceso denegado",
        message: "Token de autenticación requerido",
        code: "NO_TOKEN",
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    try {
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar el usuario en la base de datos
      const user = await db("users")
        .select(
          "id",
          "email",
          "first_name",
          "last_name",
          "user_type",
          "is_active",
          "is_verified",
          "phone",
          "profile_image_url"
        )
        .where({ id: decoded.id })
        .first();

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Usuario no encontrado",
          message: "El token corresponde a un usuario que no existe",
          code: "USER_NOT_FOUND",
        });
      }

      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          error: "Cuenta inactiva",
          message: "Tu cuenta ha sido desactivada. Contacta soporte.",
          code: "ACCOUNT_INACTIVE",
        });
      }

      // Agregar información del usuario a la request
      req.user = user;
      req.userId = user.id;
      req.userType = user.user_type;

      next();
    } catch (jwtError) {
      let errorMessage = "Token inválido";
      let errorCode = "INVALID_TOKEN";

      if (jwtError.name === "TokenExpiredError") {
        errorMessage = "Token expirado";
        errorCode = "TOKEN_EXPIRED";
      } else if (jwtError.name === "JsonWebTokenError") {
        errorMessage = "Token malformado";
        errorCode = "MALFORMED_TOKEN";
      }

      return res.status(401).json({
        success: false,
        error: "Token inválido",
        message: errorMessage,
        code: errorCode,
      });
    }
  } catch (error) {
    console.error("Error en middleware de autenticación:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: "Error al verificar autenticación",
      code: "AUTH_ERROR",
    });
  }
};

// Middleware para verificar tipo de usuario específico
const requireUserType = (userType) => {
  return (req, res, next) => {
    if (req.userType !== userType) {
      return res.status(403).json({
        success: false,
        error: "Acceso denegado",
        message: `Esta acción requiere ser ${userType}`,
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }
    next();
  };
};

// Middleware para verificar que el usuario sea profesional
const requireProfessional = requireUserType("professional");

// Middleware para verificar que el usuario sea cliente
const requireClient = requireUserType("client");

// Middleware para verificar que el usuario esté verificado
const requireVerifiedUser = (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      error: "Verificación requerida",
      message: "Debes verificar tu cuenta para realizar esta acción",
      code: "VERIFICATION_REQUIRED",
    });
  }
  next();
};

// Middleware opcional de auth (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      req.userId = null;
      req.userType = null;
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await db("users")
        .select(
          "id",
          "email",
          "first_name",
          "last_name",
          "user_type",
          "is_active",
          "is_verified"
        )
        .where({ id: decoded.id })
        .first();

      if (user && user.is_active) {
        req.user = user;
        req.userId = user.id;
        req.userType = user.user_type;
      } else {
        req.user = null;
        req.userId = null;
        req.userType = null;
      }
    } catch (jwtError) {
      req.user = null;
      req.userId = null;
      req.userType = null;
    }

    next();
  } catch (error) {
    console.error("Error en optional auth middleware:", error);
    req.user = null;
    req.userId = null;
    req.userType = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  requireProfessional,
  requireClient,
  requireVerifiedUser,
  requireUserType,
  optionalAuth,
};
