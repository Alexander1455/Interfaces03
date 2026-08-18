const app = require('./app');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

dotenv.config();

const PORT = process.env.PORT || 9090;

async function startServer() {
  console.log('====================================================');
  console.log('🚀 Iniciando IDAT Backend - Sistema Escolar (REST API)');
  console.log('====================================================');

  // Probar conexión a MySQL
  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    console.warn('⚠️ [Aviso] No se pudo conectar a MySQL inmediatamente.');
    console.warn('   Asegúrate de que MySQL (XAMPP / Laragon / Servicio local) esté ejecutándose');
    console.warn('   y que los datos en backend/.env sean correctos.');
  }

  const server = app.listen(PORT, () => {
    console.log(`🌐 Servidor escuchando en: http://localhost:${PORT}`);
    console.log(`📡 Endpoints disponibles en: http://localhost:${PORT}/api`);
    console.log(`🔒 Autenticación JWT activa en: http://localhost:${PORT}/api/auth/login`);
    console.log('====================================================');
  });

  return server;
}

startServer();
