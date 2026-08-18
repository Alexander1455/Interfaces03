const { query } = require('../config/db');

// Guardar o actualizar una nota individual
const upsertNota = async (id_curso, id_alumno, nombre_evaluacion, calificacion, ponderacion) => {
  if (calificacion === null || calificacion === undefined || isNaN(calificacion)) return;
  
  const existing = await query(`
    SELECT id_nota FROM nota_curso 
    WHERE id_curso = ? AND id_alumno = ? AND nombre_evaluacion = ?
  `, [id_curso, id_alumno, nombre_evaluacion]);

  if (existing.length > 0) {
    await query(`
      UPDATE nota_curso 
      SET calificacion = ?, ponderacion = ?, fecha_registro = CURRENT_TIMESTAMP
      WHERE id_nota = ?
    `, [calificacion, ponderacion, existing[0].id_nota]);
  } else {
    await query(`
      INSERT INTO nota_curso (id_curso, id_alumno, nombre_evaluacion, calificacion, ponderacion)
      VALUES (?, ?, ?, ?, ?)
    `, [id_curso, id_alumno, nombre_evaluacion, calificacion, ponderacion]);
  }
};

// Guardar notas masivas para un curso
const guardarNotasCurso = async (req, res, next) => {
  try {
    const { cursoId } = req.params;
    const notasList = req.body.notasList || req.body;

    if (!Array.isArray(notasList)) {
      return res.status(400).json({ success: false, message: 'Se espera un array de notas' });
    }

    for (const item of notasList) {
      let targetAlumnoId = item.id_alumno;
      if (!targetAlumnoId && (item.estudianteId || item.id_usuario)) {
        const studentUserId = item.estudianteId || item.id_usuario;
        const aRows = await query('SELECT id_alumno FROM alumno WHERE id_usuario = ? OR id_alumno = ?', [studentUserId, studentUserId]);
        if (aRows.length > 0) targetAlumnoId = aRows[0].id_alumno;
      }

      if (!targetAlumnoId && item.matriculaId) {
        const mRows = await query('SELECT id_alumno FROM matricula WHERE id_matricula = ?', [item.matriculaId]);
        if (mRows.length > 0) targetAlumnoId = mRows[0].id_alumno;
      }

      if (!targetAlumnoId) continue;

      if (item.notaEC1 !== undefined) await upsertNota(cursoId, targetAlumnoId, 'Evaluación Continua 1 (EC1)', item.notaEC1, 20.00);
      if (item.notaEC2 !== undefined) await upsertNota(cursoId, targetAlumnoId, 'Evaluación Continua 2 (EC2)', item.notaEC2, 20.00);
      if (item.notaEC3 !== undefined) await upsertNota(cursoId, targetAlumnoId, 'Evaluación Continua 3 (EC3)', item.notaEC3, 20.00);
      if (item.notaEF !== undefined) await upsertNota(cursoId, targetAlumnoId, 'Examen Final (EF)', item.notaEF, 40.00);
    }

    res.json({ success: true, message: 'Notas registradas correctamente' });
  } catch (error) {
    next(error);
  }
};

// Actualizar notas de una matrícula específica
const actualizarNotas = async (req, res, next) => {
  try {
    const { matriculaId } = req.params;
    const { notaEC1, notaEC2, notaEC3, notaEF, cursoId } = req.body;

    const mRows = await query('SELECT id_alumno, id_seccion FROM matricula WHERE id_matricula = ?', [matriculaId]);
    if (mRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Matrícula no encontrada' });
    }

    const { id_alumno, id_seccion } = mRows[0];
    let resolvedCursoId = cursoId;
    if (!resolvedCursoId) {
      const cRows = await query('SELECT id_curso FROM curso WHERE id_seccion = ? LIMIT 1', [id_seccion]);
      if (cRows.length > 0) resolvedCursoId = cRows[0].id_curso;
    }

    if (resolvedCursoId) {
      if (notaEC1 !== undefined) await upsertNota(resolvedCursoId, id_alumno, 'Evaluación Continua 1 (EC1)', notaEC1, 20.00);
      if (notaEC2 !== undefined) await upsertNota(resolvedCursoId, id_alumno, 'Evaluación Continua 2 (EC2)', notaEC2, 20.00);
      if (notaEC3 !== undefined) await upsertNota(resolvedCursoId, id_alumno, 'Evaluación Continua 3 (EC3)', notaEC3, 20.00);
      if (notaEF !== undefined) await upsertNota(resolvedCursoId, id_alumno, 'Examen Final (EF)', notaEF, 40.00);
    }

    res.json({ success: true, message: 'Notas de la matrícula actualizadas correctamente' });
  } catch (error) {
    next(error);
  }
};

// Obtener boleta de notas del estudiante
const getBoletaEstudiante = async (req, res, next) => {
  try {
    const { estudianteId } = req.params;

    let targetAlumnoId = estudianteId;
    const aRows = await query('SELECT id_alumno FROM alumno WHERE id_usuario = ? OR id_alumno = ?', [estudianteId, estudianteId]);
    if (aRows.length > 0) targetAlumnoId = aRows[0].id_alumno;

    const sql = `
      SELECT 
        c.id_curso AS cursoId,
        CONCAT('CUR-', LPAD(c.id_curso, 3, '0')) AS codigoCurso,
        c.nombre AS nombreCurso,
        4 AS creditos,
        COALESCE(CONCAT(ud.nombre, ' ', ud.apellido), 'Docente Principal') AS docenteNombre,
        'Lun y Mie 19:00 - 22:00' AS horario,
        (SELECT calificacion FROM nota_curso WHERE id_curso = c.id_curso AND id_alumno = ? AND nombre_evaluacion LIKE '%EC1%' LIMIT 1) AS notaEC1,
        (SELECT calificacion FROM nota_curso WHERE id_curso = c.id_curso AND id_alumno = ? AND nombre_evaluacion LIKE '%EC2%' LIMIT 1) AS notaEC2,
        (SELECT calificacion FROM nota_curso WHERE id_curso = c.id_curso AND id_alumno = ? AND nombre_evaluacion LIKE '%EC3%' LIMIT 1) AS notaEC3,
        (SELECT calificacion FROM nota_curso WHERE id_curso = c.id_curso AND id_alumno = ? AND (nombre_evaluacion LIKE '%EF%' OR nombre_evaluacion LIKE '%Final%') LIMIT 1) AS notaEF
      FROM matricula m
      INNER JOIN seccion s ON m.id_seccion = s.id_seccion
      INNER JOIN curso c ON c.id_seccion = s.id_seccion
      LEFT JOIN asignacion_curso ac ON c.id_curso = ac.id_curso AND ac.estado = 1
      LEFT JOIN docente d ON ac.id_docente = d.id_docente
      LEFT JOIN usuario ud ON d.id_usuario = ud.id_usuario
      WHERE m.id_alumno = ? AND m.estado = 1
    `;

    const rows = await query(sql, [targetAlumnoId, targetAlumnoId, targetAlumnoId, targetAlumnoId, targetAlumnoId]);

    const boleta = rows.map(r => {
      const ec1 = r.notaEC1 !== null ? Number(r.notaEC1) : null;
      const ec2 = r.notaEC2 !== null ? Number(r.notaEC2) : null;
      const ec3 = r.notaEC3 !== null ? Number(r.notaEC3) : null;
      const ef = r.notaEF !== null ? Number(r.notaEF) : null;

      let promedioFinal = null;
      let estadoAcademico = 'EN_CURSO';

      if (ec1 !== null && ec2 !== null && ec3 !== null && ef !== null) {
        promedioFinal = Number(((ec1 * 0.20) + (ec2 * 0.20) + (ec3 * 0.20) + (ef * 0.40)).toFixed(2));
        estadoAcademico = promedioFinal >= 12.5 ? 'APROBADO' : 'DESAPROBADO';
      }

      return {
        ...r,
        notaEC1: ec1,
        notaEC2: ec2,
        notaEC3: ec3,
        notaEF: ef,
        promedioFinal,
        estadoAcademico,
        observaciones: promedioFinal ? (promedioFinal >= 12.5 ? 'Aprobado' : 'Desaprobado') : 'En curso'
      };
    });

    res.json(boleta);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  guardarNotasCurso,
  actualizarNotas,
  getBoletaEstudiante
};
