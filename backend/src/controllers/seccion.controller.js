const { query } = require('../config/db');

const getSecciones = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        s.id_seccion,
        s.nombre_seccion,
        s.periodo_academico,
        s.capacidad_maxima,
        s.estado,
        COUNT(DISTINCT m.id_matricula) AS total_matriculados,
        (s.capacidad_maxima - COUNT(DISTINCT m.id_matricula)) AS cupos_disponibles
      FROM seccion s
      LEFT JOIN matricula m ON s.id_seccion = m.id_seccion AND m.estado = 1
      GROUP BY s.id_seccion
      ORDER BY s.id_seccion ASC
    `;
    const rows = await query(sql);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

const getSeccionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        s.id_seccion,
        s.nombre_seccion,
        s.periodo_academico,
        s.capacidad_maxima,
        s.estado,
        COUNT(DISTINCT m.id_matricula) AS total_matriculados
      FROM seccion s
      LEFT JOIN matricula m ON s.id_seccion = m.id_seccion AND m.estado = 1
      WHERE s.id_seccion = ?
      GROUP BY s.id_seccion
    `;
    const rows = await query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sección no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

const createSeccion = async (req, res, next) => {
  try {
    const { nombre_seccion, periodo_academico, capacidad_maxima, estado = 1 } = req.body;
    if (!nombre_seccion || !periodo_academico || !capacidad_maxima) {
      return res.status(400).json({ success: false, message: 'Nombre, Periodo y Capacidad son requeridos.' });
    }

    const result = await query(`
      INSERT INTO seccion (nombre_seccion, periodo_academico, capacidad_maxima, estado)
      VALUES (?, ?, ?, ?)
    `, [nombre_seccion, periodo_academico, capacidad_maxima, estado ? 1 : 0]);

    res.status(201).json({
      id_seccion: result.insertId,
      nombre_seccion,
      periodo_academico,
      capacidad_maxima,
      estado: Boolean(estado)
    });
  } catch (error) {
    next(error);
  }
};

const updateSeccion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre_seccion, periodo_academico, capacidad_maxima, estado } = req.body;

    await query(`
      UPDATE seccion
      SET nombre_seccion = COALESCE(?, nombre_seccion),
          periodo_academico = COALESCE(?, periodo_academico),
          capacidad_maxima = COALESCE(?, capacidad_maxima),
          estado = COALESCE(?, estado)
      WHERE id_seccion = ?
    `, [nombre_seccion, periodo_academico, capacidad_maxima, estado, id]);

    res.json({ success: true, message: 'Sección actualizada exitosamente' });
  } catch (error) {
    next(error);
  }
};

const deleteSeccion = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM seccion WHERE id_seccion = ?', [id]);
    res.json({ success: true, message: 'Sección eliminada exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSecciones,
  getSeccionById,
  createSeccion,
  updateSeccion,
  deleteSeccion
};
