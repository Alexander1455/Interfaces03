const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd_escolar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  dateStrings: true
});

const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

const execute = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return result;
};

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ [MySQL] Conexión a la base de datos establecida correctamente.');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ [MySQL] Error conectando a la base de datos:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  execute,
  testConnection
};
