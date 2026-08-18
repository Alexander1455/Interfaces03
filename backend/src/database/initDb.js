const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'bd_escolar';

  console.log(`⏳ Conectando a MySQL en ${host}:${port}...`);
  
  let connection;
  try {
    connection = await mysql.createConnection({ host, port, user, password });
    console.log('✅ Conexión con el servidor MySQL exitosa.');

    console.log(`⏳ Creando base de datos '${dbName}' si no existe...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    console.log('⏳ Creando tablas del esquema escolar...');

    // 1. rol
    await connection.query(`
      CREATE TABLE IF NOT EXISTS rol (
        id_rol INT AUTO_INCREMENT,
        nombre_rol VARCHAR(50) NOT NULL UNIQUE,
        descripcion VARCHAR(255) NULL,
        CONSTRAINT pk_rol PRIMARY KEY (id_rol)
      ) ENGINE=InnoDB;
    `);

    // 2. usuario
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuario (
        id_usuario INT AUTO_INCREMENT,
        dni VARCHAR(20) NOT NULL UNIQUE,
        nombre VARCHAR(100) NOT NULL,
        apellido VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        estado TINYINT(1) NOT NULL DEFAULT 1,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        id_rol INT NOT NULL,
        CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
        CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) 
            REFERENCES rol (id_rol) 
            ON DELETE RESTRICT 
            ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 3. docente
    await connection.query(`
      CREATE TABLE IF NOT EXISTS docente (
        id_docente INT AUTO_INCREMENT,
        id_usuario INT NOT NULL UNIQUE,
        especialidad VARCHAR(100) NOT NULL,
        grado_academico VARCHAR(100) NULL,
        telefono VARCHAR(20) NULL,
        CONSTRAINT pk_docente PRIMARY KEY (id_docente),
        CONSTRAINT fk_docente_usuario FOREIGN KEY (id_usuario) 
            REFERENCES usuario (id_usuario) 
            ON DELETE CASCADE 
            ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 4. alumno
    await connection.query(`
      CREATE TABLE IF NOT EXISTS alumno (
        id_alumno INT AUTO_INCREMENT,
        id_usuario INT NOT NULL UNIQUE,
        dni_apoderado VARCHAR(20) NULL,
        telefono VARCHAR(20) NULL,
        fecha_nacimiento DATE NULL,
        CONSTRAINT pk_alumno PRIMARY KEY (id_alumno),
        CONSTRAINT fk_alumno_usuario FOREIGN KEY (id_usuario) 
            REFERENCES usuario (id_usuario) 
            ON DELETE CASCADE 
            ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 5. seccion
    await connection.query(`
      CREATE TABLE IF NOT EXISTS seccion (
        id_seccion INT AUTO_INCREMENT,
        nombre_seccion VARCHAR(50) NOT NULL,
        periodo_academico VARCHAR(50) NOT NULL,
        capacidad_maxima INT NOT NULL,
        estado TINYINT(1) NOT NULL DEFAULT 1,
        CONSTRAINT pk_seccion PRIMARY KEY (id_seccion)
      ) ENGINE=InnoDB;
    `);

    // 6. curso
    await connection.query(`
      CREATE TABLE IF NOT EXISTS curso (
        id_curso INT AUTO_INCREMENT,
        id_seccion INT NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        descripcion TEXT NULL,
        estado TINYINT(1) NOT NULL DEFAULT 1,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_curso PRIMARY KEY (id_curso),
        CONSTRAINT fk_curso_seccion FOREIGN KEY (id_seccion) 
            REFERENCES seccion (id_seccion) 
            ON DELETE RESTRICT 
            ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    // 7. matricula
    await connection.query(`
      CREATE TABLE IF NOT EXISTS matricula (
        id_matricula INT AUTO_INCREMENT,
        id_alumno INT NOT NULL,
        id_seccion INT NOT NULL,
        fecha_matricula DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        estado TINYINT(1) NOT NULL DEFAULT 1,
        CONSTRAINT pk_matricula PRIMARY KEY (id_matricula),
        CONSTRAINT fk_matricula_alumno FOREIGN KEY (id_alumno) 
            REFERENCES alumno (id_alumno) 
            ON DELETE RESTRICT 
            ON UPDATE CASCADE,
        CONSTRAINT fk_matricula_seccion FOREIGN KEY (id_seccion) 
            REFERENCES seccion (id_seccion) 
            ON DELETE RESTRICT 
            ON UPDATE CASCADE,
        CONSTRAINT uq_alumno_seccion UNIQUE (id_alumno, id_seccion)
      ) ENGINE=InnoDB;
    `);

    // 8. asignacion_curso
    await connection.query(`
      CREATE TABLE IF NOT EXISTS asignacion_curso (
        id_asignacion INT AUTO_INCREMENT,
        id_docente INT NOT NULL,
        id_curso INT NOT NULL,
        estado TINYINT(1) NOT NULL DEFAULT 1,
        fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_asignacion PRIMARY KEY (id_asignacion),
        CONSTRAINT fk_asignacion_docente FOREIGN KEY (id_docente) 
            REFERENCES docente (id_docente) 
            ON DELETE RESTRICT 
            ON UPDATE CASCADE,
        CONSTRAINT fk_asignacion_curso FOREIGN KEY (id_curso) 
            REFERENCES curso (id_curso) 
            ON DELETE CASCADE 
            ON UPDATE CASCADE,
        CONSTRAINT uq_docente_curso UNIQUE (id_docente, id_curso)
      ) ENGINE=InnoDB;
    `);

    // 9. nota_curso
    await connection.query(`
      CREATE TABLE IF NOT EXISTS nota_curso (
        id_nota INT AUTO_INCREMENT,
        id_curso INT NOT NULL,
        id_alumno INT NOT NULL,
        nombre_evaluacion VARCHAR(100) NOT NULL,
        calificacion DECIMAL(5,2) NOT NULL,
        ponderacion DECIMAL(5,2) NOT NULL,
        fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT pk_nota_curso PRIMARY KEY (id_nota),
        CONSTRAINT fk_nota_curso FOREIGN KEY (id_curso) 
            REFERENCES curso (id_curso) 
            ON DELETE CASCADE 
            ON UPDATE CASCADE,
        CONSTRAINT fk_nota_alumno FOREIGN KEY (id_alumno) 
            REFERENCES alumno (id_alumno) 
            ON DELETE RESTRICT 
            ON UPDATE CASCADE
      ) ENGINE=InnoDB;
    `);

    console.log('✅ Base de datos y las 9 tablas creadas exitosamente.');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
