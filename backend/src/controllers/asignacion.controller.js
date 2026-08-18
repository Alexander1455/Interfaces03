const { query } = require('../config/db');

const getAsignaciones = async (req, res, next) => {
  try {
    const { docenteId, cursoId } = req.query;
    let whereClauses = [];
    let params = [];

    if (docenteId) {
      whereClauses.push('ac.id_docente = ?');
      params.push(docenteId);
    }
    if (cursoId) {
      whereClauses.push('ac.id_curso = ?');
      params.push(cursoId);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT 
        ac.id_asignacion,
        ac.id_docente,
        ac.id_curso,
        ac.estado,
        ac.fecha_asignacion,
        d.especialidad,
        CONCAT(ud.nombre, ' ', ud.apellido) AS docenteNombre,
        c.nombre AS cursoNombre,
        s.nombre_seccion
      FROM asignacion_curso ac
      INNER JOIN docente d ON ac.id_docente = d.id_docente
      INNER JOIN usuario ud ON d.id_usuario = ud.id_usuario
      INNER JOIN curso c ON ac.id_curso = c.id_curso
      INNER JOIN seccion s ON c.id_seccion = s.id_seccion
      ${whereStr}
      ORDER BY ac.id_asignacion DESC
    `;
    const rows = await query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

const createAsignacion = async (req, res, next) => {
  try {
    const { id_docente, id_curso, estado = 1 } = req.body;
    if (!id_docente || !id_curso) {
      return res.status(400).json({ success: false, message: 'Docente y Curso son obligatorios' });
    }

    const result = await query(`
      INSERT INTO asignacion_curso (id_docente, id_curso, estado)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE id_docente = VALUES(id_docente), estado = VALUES(estado)
    `, [id_docente, id_curso, estado ? 1 : 0]);

    res.status(201).json({
      id_asignacion: result.insertId,
      id_docente,
      id_curso,
      estado: Boolean(estado)
    });
  } catch (error) {
    next(error);
  }
};

const deleteAsignacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM asignacion_curso WHERE id_asignacion = ?', [id]);
    res.json({ success: true, message: 'Asignación eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAsignaciones,
  createAsignacion,
  deleteAsignacion
};
