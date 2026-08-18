const { query } = require('../config/db');

// Obtener matrículas con cálculo de notas
const getMatriculas = async (req, res, next) => {
  try {
    const { estudianteId, alumnoId, cursoId, seccionId } = req.query;

    let whereClauses = [];
    let params = [];

    if (estudianteId || alumnoId) {
      // Buscar tanto por id_alumno como por id_usuario del estudiante
      const targetId = estudianteId || alumnoId;
      whereClauses.push('(a.id_alumno = ? OR a.id_usuario = ?)');
      params.push(targetId, targetId);
    }

    if (seccionId) {
      whereClauses.push('m.id_seccion = ?');
      params.push(seccionId);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        m.id_matricula AS id,
        m.id_matricula,
        m.id_alumno,
        a.id_usuario AS estudianteId,
        CONCAT(u.nombre, ' ', u.apellido) AS estudianteNombre,
        u.dni AS estudianteCodigo,
        u.email AS estudianteEmail,
        c.id_curso AS cursoId,
        c.nombre AS cursoNombre,
        CONCAT('CUR-', LPAD(c.id_curso, 3, '0')) AS cursoCodigo,
        m.fecha_matricula AS fechaMatricula,
        m.estado,
        -- Evaluaciones
        (SELECT calificacion FROM nota_curso WHERE id_curso = c.id_curso AND id_alumno = a.id_alumno AND nombre_evaluacion LIKE '%EC1%' LIMIT 1) AS notaEC1,
        (SELECT calificacion FROM nota_curso WHERE id_curso = c.id_curso AND id_alumno = a.id_alumno AND nombre_evaluacion LIKE '%EC2%' LIMIT 1) AS notaEC2,
        (SELECT calificacion FROM nota_curso WHERE id_curso = c.id_curso AND id_alumno = a.id_alumno AND nombre_evaluacion LIKE '%EC3%' LIMIT 1) AS notaEC3,
        (SELECT calificacion FROM nota_curso WHERE id_curso = c.id_curso AND id_alumno = a.id_alumno AND (nombre_evaluacion LIKE '%EF%' OR nombre_evaluacion LIKE '%Final%') LIMIT 1) AS notaEF
      FROM matricula m
      INNER JOIN alumno a ON m.id_alumno = a.id_alumno
      INNER JOIN usuario u ON a.id_usuario = u.id_usuario
      INNER JOIN seccion s ON m.id_seccion = s.id_seccion
      LEFT JOIN curso c ON c.id_seccion = s.id_seccion
      ${whereStr}
      ORDER BY m.id_matricula DESC
    `;

    const rows = await query(sql, params);

    // Calcular promedios ponderados y estado académico
    const result = rows.map(r => {
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
        id: r.id,
        id_matricula: r.id_matricula,
        estudianteId: r.estudianteId,
        estudianteNombre: r.estudianteNombre,
        estudianteCodigo: r.estudianteCodigo,
        estudianteEmail: r.estudianteEmail,
        cursoId: r.cursoId,
        cursoNombre: r.cursoNombre,
        cursoCodigo: r.cursoCodigo,
        fechaMatricula: r.fechaMatricula,
        notaEC1: ec1,
        notaEC2: ec2,
        notaEC3: ec3,
        notaEF: ef,
        promedioFinal,
        estadoAcademico,
        observaciones: promedioFinal ? (promedioFinal >= 12.5 ? 'Aprobado satisfactoriamente' : 'Requiere recuperación') : 'En curso'
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Matricular un estudiante
const matricular = async (req, res, next) => {
  try {
    const { estudianteId, alumnoId, cursoId, seccionId } = req.body;

    let targetAlumnoId = alumnoId;
    if (!targetAlumnoId && estudianteId) {
      const aRows = await query('SELECT id_alumno FROM alumno WHERE id_usuario = ? OR id_alumno = ?', [estudianteId, estudianteId]);
      if (aRows.length > 0) targetAlumnoId = aRows[0].id_alumno;
    }

    if (!targetAlumnoId) {
      return res.status(400).json({ success: false, message: 'Perfil de alumno no encontrado.' });
    }

    let targetSeccionId = seccionId;
    if (!targetSeccionId && cursoId) {
      const cRows = await query('SELECT id_seccion FROM curso WHERE id_curso = ?', [cursoId]);
      if (cRows.length > 0) targetSeccionId = cRows[0].id_seccion;
    }

    if (!targetSeccionId) {
      const sRows = await query('SELECT id_seccion FROM seccion LIMIT 1');
      targetSeccionId = sRows.length > 0 ? sRows[0].id_seccion : 1;
    }

    // Verificar si ya está matriculado
    const existing = await query('SELECT id_matricula FROM matricula WHERE id_alumno = ? AND id_seccion = ?', [targetAlumnoId, targetSeccionId]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'El estudiante ya está matriculado en esta sección/curso.' });
    }

    const result = await query(`
      INSERT INTO matricula (id_alumno, id_seccion, estado)
      VALUES (?, ?, 1)
    `, [targetAlumnoId, targetSeccionId]);

    res.status(201).json({
      id: result.insertId,
      id_matricula: result.insertId,
      id_alumno: targetAlumnoId,
      id_seccion: targetSeccionId,
      mensaje: 'Matrícula realizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Desmatricular estudiante
const desmatricular = async (req, res, next) => {
  try {
    const { estudianteId, cursoId, matriculaId } = req.body;

    if (matriculaId) {
      await query('DELETE FROM matricula WHERE id_matricula = ?', [matriculaId]);
      return res.json({ success: true, message: 'Matrícula anulada correctamente' });
    }

    let targetAlumnoId = estudianteId;
    const aRows = await query('SELECT id_alumno FROM alumno WHERE id_usuario = ? OR id_alumno = ?', [estudianteId, estudianteId]);
    if (aRows.length > 0) targetAlumnoId = aRows[0].id_alumno;

    let targetSeccionId = null;
    if (cursoId) {
      const cRows = await query('SELECT id_seccion FROM curso WHERE id_curso = ?', [cursoId]);
      if (cRows.length > 0) targetSeccionId = cRows[0].id_seccion;
    }

    if (targetAlumnoId && targetSeccionId) {
      await query('DELETE FROM matricula WHERE id_alumno = ? AND id_seccion = ?', [targetAlumnoId, targetSeccionId]);
      return res.json({ success: true, message: 'Desmatriculado con éxito' });
    }

    res.status(400).json({ success: false, message: 'Parámetros insuficientes para desmatricular' });
  } catch (error) {
    next(error);
  }
};

// Obtener matrículas y notas de alumnos en un curso específico (para el profesor)
const getMatriculasPorCurso = async (req, res, next) => {
  try {
    const { cursoId } = req.params;
    
    // Obtener sección del curso
    const cRows = await query('SELECT id_seccion, nombre FROM curso WHERE id_curso = ?', [cursoId]);
    if (cRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    }
    const seccionId = cRows[0].id_seccion;

    const sql = `
      SELECT 
        m.id_matricula AS id,
        m.id_matricula,
        a.id_alumno,
        a.id_usuario AS estudianteId,
        CONCAT(u.nombre, ' ', u.apellido) AS estudianteNombre,
        u.dni AS estudianteCodigo,
        u.email AS estudianteEmail,
        ? AS cursoId,
        ? AS cursoNombre,
        (SELECT calificacion FROM nota_curso WHERE id_curso = ? AND id_alumno = a.id_alumno AND nombre_evaluacion LIKE '%EC1%' LIMIT 1) AS notaEC1,
        (SELECT calificacion FROM nota_curso WHERE id_curso = ? AND id_alumno = a.id_alumno AND nombre_evaluacion LIKE '%EC2%' LIMIT 1) AS notaEC2,
        (SELECT calificacion FROM nota_curso WHERE id_curso = ? AND id_alumno = a.id_alumno AND nombre_evaluacion LIKE '%EC3%' LIMIT 1) AS notaEC3,
        (SELECT calificacion FROM nota_curso WHERE id_curso = ? AND id_alumno = a.id_alumno AND (nombre_evaluacion LIKE '%EF%' OR nombre_evaluacion LIKE '%Final%') LIMIT 1) AS notaEF
      FROM matricula m
      INNER JOIN alumno a ON m.id_alumno = a.id_alumno
      INNER JOIN usuario u ON a.id_usuario = u.id_usuario
      WHERE m.id_seccion = ? AND m.estado = 1
    `;

    const rows = await query(sql, [cursoId, cRows[0].nombre, cursoId, cursoId, cursoId, cursoId, seccionId]);

    const result = rows.map(r => {
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
        id: r.id,
        id_matricula: r.id_matricula,
        estudianteId: r.estudianteId,
        estudianteNombre: r.estudianteNombre,
        estudianteCodigo: r.estudianteCodigo,
        estudianteEmail: r.estudianteEmail,
        cursoId: Number(cursoId),
        notaEC1: ec1,
        notaEC2: ec2,
        notaEC3: ec3,
        notaEF: ef,
        promedioFinal,
        estadoAcademico
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMatriculas,
  matricular,
  desmatricular,
  getMatriculasPorCurso
};
