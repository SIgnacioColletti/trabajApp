# 🔧 TrabajApp - Conectando Oficios con Clientes

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/trabajapp/trabajapp)
[![Node.js](https://img.shields.io/badge/node.js-16%2B-green.svg)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/react%20native-0.72-blue.svg)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-13%2B-blue.svg)](https://postgresql.org/)

> Plataforma digital que conecta de manera eficiente y confiable a profesionales de oficios con clientes que necesitan servicios específicos en el Gran Rosario.

## 📱 Características Principales

### Para Clientes
- 🔍 **Búsqueda inteligente** de profesionales por ubicación y especialidad
- 💰 **Cotizaciones múltiples** para comparar precios y servicios
- ⭐ **Sistema de calificaciones** y reseñas verificadas
- 💬 **Chat en tiempo real** para coordinar trabajos
- 💳 **Pagos seguros** integrados en la plataforma
- 📍 **Geolocalización** para encontrar profesionales cercanos

### Para Profesionales
- 📈 **Mayor visibilidad** y captación de clientes
- 📋 **Gestión de agenda** y disponibilidad
- 💼 **Portfolio digital** para mostrar trabajos anteriores
- 📊 **Estadísticas** de desempeño y ganancias
- 🏆 **Sistema de verificación** y badges de calidad
- 📱 **Notificaciones push** para nuevas oportunidades

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** + **Express.js** - Servidor API REST
- **PostgreSQL** - Base de datos principal
- **Knex.js** - Query builder y migraciones
- **Socket.IO** - Chat en tiempo real
- **JWT** - Autenticación segura
- **Mercado Pago SDK** - Procesamiento de pagos
- **Twilio** - SMS y notificaciones
- **AWS S3** - Almacenamiento de imágenes

### Frontend (React Native)
- **React Native** 0.72 - Framework multiplataforma
- **Expo** - Desarrollo y deployment
- **React Navigation** 6.x - Navegación
- **React Hook Form** - Manejo de formularios
- **Axios** - Cliente HTTP
- **Socket.IO Client** - Chat tiempo real
- **React Native Maps** - Mapas y geolocalización

### DevOps
- **Docker** - Containerización
- **AWS EC2** - Hosting del backend
- **AWS RDS** - Base de datos PostgreSQL
- **CloudFront** - CDN para assets
- **GitHub Actions** - CI/CD

## 🚀 Instalación y Configuración

### Prerrequisitos
```bash
# Node.js 16 o superior
node --version  # v16.0.0+

# PostgreSQL 13 o superior
psql --version  # PostgreSQL 13.0+

# Expo CLI
npm install -g @expo/cli

# Git
git --version
```

### 1. Clonar el Repositorio
```bash
git clone https://github.com/trabajapp/trabajapp.git
cd trabajapp
```

### 2. Configurar Backend

#### Instalar Dependencias
```bash
cd backend
npm install
```

#### Configurar Variables de Entorno
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trabajapp_dev
DB_USER=postgres
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro

# Mercado Pago
MP_ACCESS_TOKEN=tu_mp_access_token
MP_PUBLIC_KEY=tu_mp_public_key

# Twilio
TWILIO_ACCOUNT_SID=tu_twilio_sid
TWILIO_AUTH_TOKEN=tu_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Google Maps
GOOGLE_MAPS_API_KEY=tu_google_maps_key
```

#### Crear Base de Datos
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE trabajapp_dev;
CREATE DATABASE trabajapp_test;

# Salir
\q
```

#### Ejecutar Migraciones y Seeds
```bash
# Ejecutar migraciones
npm run migrate

# Insertar datos iniciales
npm run seed

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### 3. Configurar Frontend

#### Instalar Dependencias
```bash
cd frontend
npm install
```

#### Configurar Variables de Entorno
```bash
cp .env.example .env
```

Editar `.env`:
```env
API_BASE_URL=http://localhost:3000/api/v1
GOOGLE_MAPS_API_KEY=tu_google_maps_key
```

#### Iniciar Aplicación
```bash
# Iniciar Expo
npm start

# Para iOS
npm run ios

# Para Android
npm run androi
