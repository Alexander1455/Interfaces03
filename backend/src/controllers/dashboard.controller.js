const { query } = require('../config/db');

const getDashboardMetrics = async (req, res, next) => {
  try {
    // 1. Conteo de usuarios por rol
    const userCounts = await query(`
      SELECT 
        COUNT(*) AS totalUsuarios,
        SUM(CASE WHEN r.nombre_rol = 'ADMIN' THEN 1 ELSE 0 END) AS totalAdmins,
        SUM(CASE WHEN r.nombre_rol = 'DOCENTE' THEN 1 ELSE 0 END) AS totalDocentes,
        SUM(CASE WHEN r.nombre_rol = 'ALUMNO' THEN 1 ELSE 0 END) AS totalAlumnos,
        SUM(CASE WHEN u.estado = 1 THEN 1 ELSE 0 END) AS totalActivos
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
    `);

    // 2. Conteo de cursos y secciones
    const cursoCounts = await query(`
      SELECT 
        COUNT(*) AS totalCursos,
        SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) AS totalCursosActivos
      FROM curso
    `);

    const seccionCounts = await query(`
      SELECT 
        COUNT(*) AS totalSecciones,
        SUM(capacidad_maxima) AS capacidadTotal
      FROM seccion
    `);

    // 3. Conteo de matrículas
    const matriculaCounts = await query(`
      SELECT 
        COUNT(*) AS totalMatriculas,
        SUM(CASE WHEN estado = 1 THEN 1 ELSE 0 END) AS totalMatriculasActivas
      FROM matricula
    `);

    // 4. Promedio general de notas
    const notaStats = await query(`
      SELECT 
        COALESCE(AVG(calificacion), 0) AS promedioGeneral,
        COUNT(*) AS totalEvaluaciones
      FROM nota_curso
    `);

    res.json({
      success: true,
      data: {
        usuarios: userCounts[0],
        cursos: cursoCounts[0],
        secciones: seccionCounts[0],
        matriculas: matriculaCounts[0],
        estadisticas: {
          promedioGeneral: Number(Number(notaStats[0].promedioGeneral).toFixed(2)),
          totalEvaluaciones: notaStats[0].totalEvaluaciones
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics
};
