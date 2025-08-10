#!/bin/bash

# 🚀 TrabajApp - Script de Configuración Automática
# Este script crea toda la estructura de carpetas y archivos base

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}                     🔧 TRABAJAPP SETUP                        ${BLUE}║${NC}"
    echo -e "${BLUE}║${NC}            Conectando Oficios con Clientes                   ${BLUE}║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}\n"
}

# Verificar dependencias
check_dependencies() {
    print_status "Verificando dependencias..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instalar Node.js 16+ desde https://nodejs.org"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        print_error "Node.js versión 16+ requerida. Versión actual: $(node --version)"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado"
        exit 1
    fi
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        print_error "Git no está instalado"
        exit 1
    fi
    
    print_success "Dependencias verificadas ✓"
}

# Crear estructura de directorios
create_directories() {
    print_status "Creando estructura de directorios..."
    
    # Crear directorios principales
    mkdir -p TrabajApp
    cd TrabajApp
    
    # Backend
    mkdir -p backend/{database/{migrations,seeds},middleware,routes,utils}
    
    # Frontend
    mkdir -p frontend/{src/{components,screens/{auth,client,professional,shared},contexts,services,utils,config,navigation},assets/{images,fonts,icons}}
    
    # Documentación
    mkdir -p docs
    
    # VS Code
    mkdir -p .vscode
    
    print_success "Estructura de directorios creada ✓"
}

# Inicializar Git
initialize_git() {
    print_status "Inicializando repositorio Git..."
    
    git init
    
    # Crear .gitignore
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment Variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Build directories
build/
dist/
.expo/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary
tmp/
temp/
EOF
    
    print_success "Git inicializado ✓"
}

# Crear archivos base del backend
create_backend_files() {
    print_status "Creando archivos base del backend..."
    
    cd backend
    
    # package.json
    cat > package.json << 'EOF'
{
  "name": "trabajapp-backend",
  "version": "1.0.0",
  "description": "TrabajApp Backend API - Conectando oficios con clientes",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "migrate": "knex migrate:latest",
    "seed": "knex seed:run"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "pg": "^8.11.3",
    "knex": "^2.5.1",
    "joi": "^17.11.0",
    "nodemailer": "^6.9.7",
    "twilio": "^4.19.0",
    "socket.io": "^4.7.4",
    "mercadopago": "^1.5.17",
    "moment": "^2.29.4",
    "express-rate-limit": "^7.1.5",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  },
  "keywords": ["trabajapp", "oficios", "servicios", "marketplace"],
  "author": "TrabajApp Team",
  "license": "MIT"
}
EOF
    
    # .env template
    cat > .env.example << 'EOF'
# Configuración del servidor
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=trabajapp_dev
DB_USER=postgres
DB_PASSWORD=password

# JWT Secret
JWT_SECRET=trabajapp_jwt_secret_key_2024
JWT_EXPIRES_IN=7d

# Twilio para SMS
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Nodemailer para emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@trabajapp.com
SMTP_PASSWORD=your_email_password

# Mercado Pago
MP_ACCESS_TOKEN=your_mercado_pago_access_token
MP_PUBLIC_KEY=your_mercado_pago_public_key

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EOF
    
    # Copiar .env.example a .env
    cp .env.example .env
    
    # server.js básico
    cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TrabajApp Backend está funcionando',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
EOF
    
    # knexfile.js básico
    cat > knexfile.js << 'EOF'
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'trabajapp_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
    },
    migrations: {
      directory: './database/migrations'
    },
    seeds: {
      directory: './database/seeds'
    }
  }
};
EOF
    
    # database/connection.js
    cat > database/connection.js << 'EOF'
const knex = require('knex');
const knexConfig = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment];

const db = knex(config);

module.exports = db;
EOF
    
    cd ..
    print_success "Archivos base del backend creados ✓"
}

# Crear archivos base del frontend
create_frontend_files() {
    print_status "Creando archivos base del frontend..."
    
    cd frontend
    
    # package.json
    cat > package.json << 'EOF'
{
  "name": "trabajapp-mobile",
  "version": "1.0.0",
  "description": "TrabajApp - Aplicación móvil",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~49.0.15",
    "expo-status-bar": "~1.6.0",
    "react": "18.2.0",
    "react-native": "0.72.6",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screens": "~3.22.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/stack": "^6.3.20",
    "react-native-gesture-handler": "~2.12.0",
    "expo-location": "~16.1.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  },
  "expo": {
    "name": "TrabajApp",
    "slug": "trabajapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "platforms": ["ios", "android", "web"]
  },
  "private": true
}
EOF
    
    # App.js básico
    cat > App.js << 'EOF'
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 TrabajApp</Text>
      <Text style={styles.subtitle}>Conectando Oficios con Clientes</Text>
      <Text style={styles.status}>✅ Configuración inicial completa</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
  },
  status: {
    fontSize: 16,
    color: '#4ade80',
    fontWeight: '600',
  },
});
EOF
    
    # .env template
    cat > .env.example << 'EOF'
API_BASE_URL=http://localhost:3000/api/v1
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
EOF
    
    cp .env.example .env
    
    cd ..
    print_success "Archivos base del frontend creados ✓"
}

# Configurar VS Code
configure_vscode() {
    print_status "Configurando VS Code..."
    
    # settings.json
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "files.associations": {
    "*.js": "javascriptreact"
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "editor.tabSize": 2,
  "editor.insertSpaces": true
}
EOF
    
    # extensions.json
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-thunder-client",
    "expo.vscode-expo-tools",
    "ms-vscode.vscode-json"
  ]
}
EOF
    
    # launch.json para debugging
    cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/backend/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
EOF
    
    print_success "VS Code configurado ✓"
}

# Crear README principal
create_readme() {
    print_status "Creando documentación..."
    
    cat > README.md << 'EOF'
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
EOF
    
    print_success "Documentación creada ✓"
}

# Instalar dependencias globales
install_global_dependencies() {
    print_status "Instalando herramientas globales..."
    
    # Verificar si Expo CLI está instalado
    if ! command -v expo &> /dev/null; then
        print_status "Instalando Expo CLI..."
        npm install -g @expo/cli
    fi
    
    # Verificar si nodemon está instalado
    if ! command -v nodemon &> /dev/null; then
        print_status "Instalando nodemon..."
        npm install -g nodemon
    fi
    
    print_success "Herramientas globales instaladas ✓"
}

# Función principal
main() {
    print_header
    
    check_dependencies
    create_directories
    initialize_git
    create_backend_files
    create_frontend_files
    configure_vscode
    create_readme
    install_global_dependencies
    
    echo -e "\n${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}                    🎉 SETUP COMPLETADO                        ${GREEN}║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}\n"
    
    print_success "TrabajApp configurado exitosamente!"
    echo ""
    echo -e "${BLUE}Próximos pasos:${NC}"
    echo -e "  1. ${YELLOW}cd TrabajApp${NC}"
    echo -e "  2. ${YELLOW}code .${NC} (para abrir en VS Code)"
    echo -e "  3. Configurar variables de entorno en los archivos .env"
    echo -e "  4. Crear base de datos PostgreSQL"
    echo -e "  5. ${YELLOW}cd backend && npm install && npm run dev${NC}"
    echo -e "  6. ${YELLOW}cd frontend && npm install && npm start${NC}"
    echo ""
    echo -e "${BLUE}URLs importantes:${NC}"
    echo -e "  📡 Backend: ${YELLOW}http://localhost:3000/health${NC}"
    echo -e "  📱 Frontend: ${YELLOW}http://localhost:19006${NC}"
    echo ""
    echo -e "${GREEN}¡Happy coding! 🚀${NC}"
}

# Ejecutar script principal
main "$@"