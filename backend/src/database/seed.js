const bcrypt = require('bcryptjs');
const { query, pool } = require('../config/db');
const initDatabase = require('./initDb');

async function seedData() {
  try {
    await initDatabase();

    console.log('⏳ Poblando datos de prueba...');

    // 1. Roles
    await query(`
      INSERT INTO rol (id_rol, nombre_rol, descripcion) VALUES
      (1, 'ADMIN', 'Administrador del sistema escolar con acceso total'),
      (2, 'DOCENTE', 'Profesor o instructor con acceso a gestión académica'),
      (3, 'ALUMNO', 'Estudiante con acceso a consultas y matrícula')
      ON DUPLICATE KEY UPDATE nombre_rol=VALUES(nombre_rol), descripcion=VALUES(descripcion);
    `);

    // Hash de contraseñas de prueba
    const hashAdmin = await bcrypt.hash('admin123', 10);
    const hashProf = await bcrypt.hash('prof123', 10);
    const hashEst = await bcrypt.hash('est123', 10);

    // 2. Usuarios
    await query(`
      INSERT INTO usuario (id_usuario, dni, nombre, apellido, email, password_hash, estado, id_rol) VALUES
      (1, '70000001', 'Alexander', 'Director General', 'admin@idat.edu.pe', ?, 1, 1),
      (2, '70000002', 'Carlos', 'Mendoza Vargas', 'profesor@idat.edu.pe', ?, 1, 2),
      (3, '70000003', 'Valeria', 'Quispe Ramos', 'estudiante@idat.edu.pe', ?, 1, 3),
      (4, '70000004', 'Maria', 'Fernández Soto', 'mfernandez@idat.edu.pe', ?, 1, 2),
      (5, '70000005', 'Juan', 'Pérez Salazar', 'jperez@idat.edu.pe', ?, 1, 3)
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), apellido=VALUES(apellido), email=VALUES(email);
    `, [hashAdmin, hashProf, hashEst, hashProf, hashEst]);

    // 3. Docentes
    await query(`
      INSERT INTO docente (id_docente, id_usuario, especialidad, grado_academico, telefono) VALUES
      (1, 2, 'Desarrollo de Software y Arquitectura Web', 'Magíster en Ing. de Sistemas', '998877661'),
      (2, 4, 'Bases de Datos & Cloud Computing', 'Ingeniera de Sistemas e Informática', '998877662')
      ON DUPLICATE KEY UPDATE especialidad=VALUES(especialidad), grado_academico=VALUES(grado_academico);
    `);

    // 4. Alumnos
    await query(`
      INSERT INTO alumno (id_alumno, id_usuario, dni_apoderado, telefono, fecha_nacimiento) VALUES
      (1, 3, '40112233', '987654321', '2004-05-15'),
      (2, 5, '40998877', '987112233', '2003-11-20')
      ON DUPLICATE KEY UPDATE dni_apoderado=VALUES(dni_apoderado), telefono=VALUES(telefono);
    `);

    // 5. Secciones
    await query(`
      INSERT INTO seccion (id_seccion, nombre_seccion, periodo_academico, capacidad_maxima, estado) VALUES
      (1, 'SECCION-A (Mañana)', '2026-I', 30, 1),
      (2, 'SECCION-B (Noche)', '2026-I', 25, 1),
      (3, 'SECCION-C (Virtual)', '2026-I', 40, 1)
      ON DUPLICATE KEY UPDATE nombre_seccion=VALUES(nombre_seccion), capacidad_maxima=VALUES(capacidad_maxima);
    `);

    // 6. Cursos
    await query(`
      INSERT INTO curso (id_curso, id_seccion, nombre, descripcion, estado) VALUES
      (1, 1, 'Desarrollo de Interfaces 3 (Angular + Node)', 'Desarrollo de SPAs con Angular, Componentes, Guards, Pipes y JWT', 1),
      (2, 1, 'Base de Datos Avanzada (MySQL & NoSQL)', 'Diseño relacional, normalización, transacciones y procedimientos', 1),
      (3, 2, 'Arquitectura de Software y Microservicios', 'Patrones de arquitectura, RESTful APIs, Spring Boot y Node.js', 1),
      (4, 3, 'Seguridad en Aplicaciones Web', 'Autenticación JWT, OAuth2, encriptación y protección contra vulnerabilidades', 1)
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), descripcion=VALUES(descripcion);
    `);

    // 7. Matrícula
    await query(`
      INSERT INTO matricula (id_matricula, id_alumno, id_seccion, estado) VALUES
      (1, 1, 1, 1),
      (2, 2, 1, 1),
      (3, 1, 2, 1)
      ON DUPLICATE KEY UPDATE estado=VALUES(estado);
    `);

    // 8. Asignación de Docente a Cursos
    await query(`
      INSERT INTO asignacion_curso (id_asignacion, id_docente, id_curso, estado) VALUES
      (1, 1, 1, 1),
      (2, 2, 2, 1),
      (3, 1, 3, 1),
      (4, 2, 4, 1)
      ON DUPLICATE KEY UPDATE estado=VALUES(estado);
    `);

    // 9. Notas de Curso
    await query(`
      INSERT INTO nota_curso (id_nota, id_curso, id_alumno, nombre_evaluacion, calificacion, ponderacion) VALUES
      (1, 1, 1, 'Evaluación Continua 1 (EC1)', 18.50, 20.00),
      (2, 1, 1, 'Evaluación Continua 2 (EC2)', 17.00, 20.00),
      (3, 1, 1, 'Evaluación Continua 3 (EC3)', 19.00, 20.00),
      (4, 1, 1, 'Examen Final (EF)', 18.00, 40.00),
      (5, 1, 2, 'Evaluación Continua 1 (EC1)', 14.00, 20.00),
      (6, 1, 2, 'Evaluación Continua 2 (EC2)', 15.50, 20.00),
      (7, 2, 1, 'Evaluación Continua 1 (EC1)', 16.00, 20.00)
      ON DUPLICATE KEY UPDATE calificacion=VALUES(calificacion), ponderacion=VALUES(ponderacion);
    `);

    console.log('✅ Datos de prueba insertados exitosamente en las 9 tablas.');
    console.log('🔑 Credenciales disponibles:');
    console.log('   - Administrador: admin@idat.edu.pe / admin123');
    console.log('   - Docente: profesor@idat.edu.pe / prof123');
    console.log('   - Estudiante: estudiante@idat.edu.pe / est123');
  } catch (error) {
    console.error('❌ Error ejecutando seed:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seedData();
}

module.exports = seedData;
