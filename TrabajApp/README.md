# 🔧 TrabajApp - Conectando Oficios con Clientes

> Plataforma digital que conecta profesionales de oficios con clientes en el Gran Rosario

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 16+
- PostgreSQL 13+
- Expo CLI

### Instalación

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (nueva terminal)
cd frontend
npm install
npm start
```

## 📁 Estructura del Proyecto

```
TrabajApp/
├── backend/           # API REST con Node.js + Express
├── frontend/          # App React Native con Expo
├── docs/             # Documentación
└── README.md
```

## 🛠️ Desarrollo

### Backend
```bash
cd backend
npm run dev          # Servidor de desarrollo
npm run migrate      # Ejecutar migraciones
npm run seed         # Insertar datos de prueba
```

### Frontend
```bash
cd frontend
npm start           # Iniciar Expo
npm run ios         # Abrir en iOS
npm run android     # Abrir en Android
```

## 📱 Características

- ✅ Búsqueda de profesionales por ubicación
- ✅ Sistema de cotizaciones
- ✅ Chat en tiempo real
- ✅ Pagos seguros
- ✅ Calificaciones y reseñas
- ✅ Responsive design (móvil, tablet, desktop)

## 🔧 Configuración

1. Duplicar `.env.example` a `.env` en backend y frontend
2. Configurar variables de entorno
3. Crear base de datos PostgreSQL
4. Ejecutar migraciones

## 📚 Documentación

- [Guía de Instalación](docs/installation.md)
- [API Documentation](docs/api.md)
- [Arquitectura](docs/architecture.md)

## 👥 Equipo

- **Ignacio** - Product Owner & Full Stack Developer

## 📄 Licencia

MIT License
