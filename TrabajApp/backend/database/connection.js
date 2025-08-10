const knex = require("knex");
const knexConfig = require("../knexfile");

const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment];

const db = knex(config);

// Función para testear la conexión
const testConnection = async () => {
  try {
    await db.raw("SELECT 1");
    console.log("✅ Conexión a PostgreSQL establecida exitosamente");
    return true;
  } catch (error) {
    console.error("❌ Error conectando a PostgreSQL:", error.message);
    return false;
  }
};

// Ejecutar test de conexión al inicializar
testConnection();

module.exports = db;
