const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Importar rutas
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const professionalRoutes = require("./routes/professionals");
const serviceRoutes = require("./routes/services");
const quotationRoutes = require("./routes/quotations");
const jobRoutes = require("./routes/jobs");
const paymentRoutes = require("./routes/payments");
const reviewRoutes = require("./routes/reviews");
const uploadRoutes = require("./routes/upload");

// Importar middlewares
const errorHandler = require("./middleware/errorHandler");
const authMiddleware = require("./middleware/auth");

// Crear aplicación Express
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://trabajapp.com", "https://app.trabajapp.com"]
        : ["http://localhost:3001", "http://localhost:19006"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Configuración de Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares globales
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(limiter);

// Configuración Socket.IO para chat en tiempo real
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Token de autenticación requerido"));
  }

  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userType = decoded.type;
    next();
  } catch (err) {
    next(new Error("Token inválido"));
  }
});

io.on("connection", (socket) => {
  console.log(`Usuario conectado: ${socket.userId}`);

  // Unirse a sala personal para recibir notificaciones
  socket.join(`user_${socket.userId}`);

  // Manejo de chat de trabajos
  socket.on("join_job", (jobId) => {
    socket.join(`job_${jobId}`);
    console.log(
      `Usuario ${socket.userId} se unió al chat del trabajo ${jobId}`
    );
  });

  socket.on("send_message", async (data) => {
    try {
      const { jobId, message, type = "text" } = data;

      // Aquí guardarías el mensaje en la BD
      const messageData = {
        jobId,
        senderId: socket.userId,
        senderType: socket.userType,
        message,
        type,
        timestamp: new Date(),
        id: Date.now(), // En producción usar UUID
      };

      // Enviar mensaje a todos en la sala del trabajo
      io.to(`job_${jobId}`).emit("new_message", messageData);
    } catch (error) {
      socket.emit("error", { message: "Error al enviar mensaje" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.userId}`);
  });
});

// Hacer io disponible globalmente para otros módulos
app.set("io", io);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || "v1",
    environment: process.env.NODE_ENV,
  });
});

// Rutas de la API
const apiRouter = express.Router();

// Rutas públicas (sin autenticación)
apiRouter.use("/auth", authRoutes);

// Rutas protegidas (requieren autenticación)
apiRouter.use("/users", authMiddleware, userRoutes);
apiRouter.use("/professionals", authMiddleware, professionalRoutes);
apiRouter.use("/services", authMiddleware, serviceRoutes);
apiRouter.use("/quotations", authMiddleware, quotationRoutes);
apiRouter.use("/jobs", authMiddleware, jobRoutes);
apiRouter.use("/payments", authMiddleware, paymentRoutes);
apiRouter.use("/reviews", authMiddleware, reviewRoutes);
apiRouter.use("/upload", authMiddleware, uploadRoutes);

// Montar todas las rutas bajo /api/v1
app.use(`/api/${process.env.API_VERSION || "v1"}`, apiRouter);

// Ruta 404 para rutas no encontradas
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint no encontrado",
    message: `La ruta ${req.originalUrl} no existe en esta API`,
    availableEndpoints: [
      "GET /api/v1/health",
      "POST /api/v1/auth/register",
      "POST /api/v1/auth/login",
      "GET /api/v1/professionals/search",
      "POST /api/v1/quotations/request",
    ],
  });
});

// Middleware de manejo de errores (debe ser el último)
app.use(errorHandler);

// Inicializar servidor
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
🚀 TrabajApp Backend API iniciado exitosamente
🌐 Servidor corriendo en puerto ${PORT}
📡 Socket.IO habilitado para chat en tiempo real
🔒 Middlewares de seguridad activados
📊 Environment: ${process.env.NODE_ENV}
🕐 Timestamp: ${new Date().toISOString()}

📖 Documentación API:
   - Health: http://localhost:${PORT}/health
   - Auth: http://localhost:${PORT}/api/v1/auth/*
   - Users: http://localhost:${PORT}/api/v1/users/*
   - Jobs: http://localhost:${PORT}/api/v1/jobs/*
  `);
});

// Manejo graceful de cierre del servidor
process.on("SIGTERM", () => {
  console.log("🔴 SIGTERM recibido, cerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor cerrado exitosamente");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🔴 SIGINT recibido, cerrando servidor...");
  server.close(() => {
    console.log("✅ Servidor cerrado exitosamente");
    process.exit(0);
  });
});

module.exports = app;
