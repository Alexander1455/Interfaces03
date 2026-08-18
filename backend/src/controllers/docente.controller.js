const { query } = require('../config/db');

const getDocentes = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        d.id_docente,
        d.id_usuario,
        d.especialidad,
        d.grado_academico,
        d.telefono,
        u.dni,
        u.nombre,
        u.apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS nombreCompleto,
        u.email,
        u.estado
      FROM docente d
      INNER JOIN usuario u ON d.id_usuario = u.id_usuario
      ORDER BY d.id_docente ASC
    `;
    const rows = await query(sql);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

const getDocenteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        d.id_docente,
        d.id_usuario,
        d.especialidad,
        d.grado_academico,
        d.telefono,
        u.dni,
        u.nombre,
        u.apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS nombreCompleto,
        u.email,
        u.estado
      FROM docente d
      INNER JOIN usuario u ON d.id_usuario = u.id_usuario
      WHERE d.id_docente = ?
    `;
    const rows = await query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Docente no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateDocente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { especialidad, grado_academico, telefono } = req.body;
    await query(`
      UPDATE docente
      SET especialidad = COALESCE(?, especialidad),
          grado_academico = COALESCE(?, grado_academico),
          telefono = COALESCE(?, telefono)
      WHERE id_docente = ?
    `, [especialidad, grado_academico, telefono, id]);

    res.json({ success: true, message: 'Datos del docente actualizados' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDocentes,
  getDocenteById,
  updateDocente
};
