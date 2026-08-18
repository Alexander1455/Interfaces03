const { query } = require('../config/db');

const getAlumnos = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        a.id_alumno,
        a.id_usuario,
        a.dni_apoderado,
        a.telefono,
        a.fecha_nacimiento,
        u.dni,
        u.nombre,
        u.apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS nombreCompleto,
        u.email,
        u.estado
      FROM alumno a
      INNER JOIN usuario u ON a.id_usuario = u.id_usuario
      ORDER BY a.id_alumno ASC
    `;
    const rows = await query(sql);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

const getAlumnoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        a.id_alumno,
        a.id_usuario,
        a.dni_apoderado,
        a.telefono,
        a.fecha_nacimiento,
        u.dni,
        u.nombre,
        u.apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS nombreCompleto,
        u.email,
        u.estado
      FROM alumno a
      INNER JOIN usuario u ON a.id_usuario = u.id_usuario
      WHERE a.id_alumno = ?
    `;
    const rows = await query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

const updateAlumno = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dni_apoderado, telefono, fecha_nacimiento } = req.body;
    await query(`
      UPDATE alumno
      SET dni_apoderado = COALESCE(?, dni_apoderado),
          telefono = COALESCE(?, telefono),
          fecha_nacimiento = COALESCE(?, fecha_nacimiento)
      WHERE id_alumno = ?
    `, [dni_apoderado, telefono, fecha_nacimiento, id]);

    res.json({ success: true, message: 'Datos del alumno actualizados' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAlumnos,
  getAlumnoById,
  updateAlumno
};
