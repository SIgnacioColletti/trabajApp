const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error("Error capturado por errorHandler:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Error de validación de Joi
  if (err.isJoi) {
    const message = err.details.map((detail) => detail.message).join(", ");
    return res.status(400).json({
      success: false,
      error: "Error de validación",
      message: message,
      code: "VALIDATION_ERROR",
      details: err.details,
    });
  }

  // Error de PostgreSQL
  if (err.code) {
    switch (err.code) {
      case "23505": // Unique constraint violation
        const field = err.detail?.match(/Key \((\w+)\)/)?.[1] || "campo";
        return res.status(409).json({
          success: false,
          error: "Conflicto de datos",
          message: `Ya existe un registro con ese ${field}`,
          code: "DUPLICATE_ENTRY",
        });

      case "23503": // Foreign key constraint violation
        return res.status(400).json({
          success: false,
          error: "Referencia inválida",
          message: "El registro referenciado no existe",
          code: "INVALID_REFERENCE",
        });

      case "23502": // Not null constraint violation
        const column = err.column || "campo requerido";
        return res.status(400).json({
          success: false,
          error: "Campo requerido",
          message: `El campo ${column} es obligatorio`,
          code: "MISSING_REQUIRED_FIELD",
        });

      default:
        console.error("Error de PostgreSQL no manejado:", err);
        break;
    }
  }

  // Error de JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Token inválido",
      message: "El token de autenticación es inválido",
      code: "INVALID_TOKEN",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expirado",
      message: "El token de autenticación ha expirado",
      code: "TOKEN_EXPIRED",
    });
  }

  // Error de Cast (IDs inválidos)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "ID inválido",
      message: "El formato del ID proporcionado es inválido",
      code: "INVALID_ID_FORMAT",
    });
  }

  // Error 404 personalizado
  if (err.name === "NotFoundError") {
    return res.status(404).json({
      success: false,
      error: "Recurso no encontrado",
      message: err.message || "El recurso solicitado no existe",
      code: "RESOURCE_NOT_FOUND",
    });
  }

  // Error 403 personalizado
  if (err.name === "ForbiddenError") {
    return res.status(403).json({
      success: false,
      error: "Acceso denegado",
      message: err.message || "No tienes permisos para realizar esta acción",
      code: "ACCESS_DENIED",
    });
  }

  // Error de Multer (subida de archivos)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "Archivo demasiado grande",
      message: "El archivo excede el tamaño máximo permitido (5MB)",
      code: "FILE_TOO_LARGE",
    });
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      error: "Demasiados archivos",
      message: "Excedes el número máximo de archivos permitidos",
      code: "TOO_MANY_FILES",
    });
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      error: "Archivo no esperado",
      message: "El campo de archivo no es válido",
      code: "UNEXPECTED_FILE",
    });
  }

  // Error de conexión a base de datos
  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    return res.status(503).json({
      success: false,
      error: "Servicio no disponible",
      message: "Error de conexión a la base de datos",
      code: "DATABASE_CONNECTION_ERROR",
    });
  }

  // Error de timeout
  if (err.code === "TIMEOUT") {
    return res.status(504).json({
      success: false,
      error: "Timeout",
      message: "La operación tardó demasiado tiempo",
      code: "REQUEST_TIMEOUT",
    });
  }

  // Errores HTTP estándar
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode === 400) {
    return res.status(400).json({
      success: false,
      error: "Solicitud inválida",
      message: err.message || "Los datos enviados no son válidos",
      code: "BAD_REQUEST",
    });
  }

  if (statusCode === 401) {
    return res.status(401).json({
      success: false,
      error: "No autorizado",
      message: err.message || "Credenciales inválidas",
      code: "UNAUTHORIZED",
    });
  }

  if (statusCode === 403) {
    return res.status(403).json({
      success: false,
      error: "Acceso denegado",
      message: err.message || "No tienes permisos para esta acción",
      code: "FORBIDDEN",
    });
  }

  if (statusCode === 404) {
    return res.status(404).json({
      success: false,
      error: "No encontrado",
      message: err.message || "El recurso solicitado no existe",
      code: "NOT_FOUND",
    });
  }

  // Error interno del servidor (default)
  res.status(500).json({
    success: false,
    error: "Error interno del servidor",
    message:
      process.env.NODE_ENV === "production"
        ? "Ha ocurrido un error inesperado"
        : err.message,
    code: "INTERNAL_SERVER_ERROR",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

// Función para crear errores personalizados
const createError = (statusCode, message, code = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

// Función para manejar errores async/await
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  createError,
  asyncHandler,
};
