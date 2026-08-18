const { query } = require('../config/db');

// Función auxiliar para mapear metadatos enriquecidos de cada curso (Categoría variada, Código, Créditos y Horario)
const getCourseMeta = (id, nombre = '', desc = '', customCat = null, customCode = null, customCred = null, customHor = null, customFIni = null, customFFin = null) => {
  if (customCat && customCode && customCred) {
    return {
      codigo: customCode,
      categoria: customCat,
      creditos: Number(customCred) || 4,
      horario: customHor || 'Lun - Mie 19:00 - 21:30',
      fechaInicio: customFIni || '16 de Marzo de 2026 (Ciclo 2026-I)',
      fechaFin: customFFin || '17 de Julio de 2026 (Fin Semestre)'
    };
  }

  const nom = (nombre || '').toLowerCase();
  const allText = (nombre + ' ' + desc).toLowerCase();
  
  if (nom.includes('interfaz') || nom.includes('angular') || nom.includes('frontend') || nom.includes('desarrollo web') || (nom.includes('web') && !nom.includes('seguridad'))) {
    return {
      codigo: 'DAA-301',
      categoria: 'Desarrollo Web',
      creditos: 4,
      horario: 'Lun - Mie 19:00 - 21:30',
      fechaInicio: '16 de Marzo de 2026 (Ciclo 2026-I)',
      fechaFin: '17 de Julio de 2026 (Fin Semestre)'
    };
  } else if (nom.includes('microservicio') || nom.includes('spring') || nom.includes('cloud') || nom.includes('arquitectura') || nom.includes('backend')) {
    return {
      codigo: 'SW-402',
      categoria: 'Backend & Cloud',
      creditos: 5,
      horario: 'Mar - Jue 18:30 - 21:00',
      fechaInicio: '01 de Abril de 2026 (Ciclo 2026-I)',
      fechaFin: '31 de Julio de 2026 (Fin Evaluaciones)'
    };
  } else if (nom.includes('base de datos') || nom.includes('mysql') || nom.includes('sql') || nom.includes('nosql') || nom.includes('datos')) {
    return {
      codigo: 'DB-204',
      categoria: 'Bases de Datos',
      creditos: 3,
      horario: 'Sab 08:00 - 13:00',
      fechaInicio: '04 de Mayo de 2026 (Ciclo Modular)',
      fechaFin: '18 de Diciembre de 2026 (Fin Semestre)'
    };
  } else if (nom.includes('seguridad') || nom.includes('ciber') || nom.includes('jwt') || nom.includes('cripto') || nom.includes('owasp')) {
    return {
      codigo: 'SEC-501',
      categoria: 'Ciberseguridad',
      creditos: 4,
      horario: 'Vie 19:00 - 22:00',
      fechaInicio: '17 de Agosto de 2026 (Ciclo 2026-II)',
      fechaFin: '18 de Diciembre de 2026 (Fin Semestre)'
    };
  } else if (allText.includes('inteligencia') || allText.includes('ia') || allText.includes('machine') || allText.includes('python')) {
    return {
      codigo: 'IA-601',
      categoria: 'Inteligencia Artificial',
      creditos: 4,
      horario: 'Lun - Mie 14:00 - 16:30',
      fechaInicio: '01 de Junio de 2026 (Ciclo Intensivo)',
      fechaFin: '29 de Diciembre de 2026 (Fin Evaluaciones)'
    };
  } else if (allText.includes('móvil') || allText.includes('movil') || allText.includes('flutter') || allText.includes('android') || allText.includes('ios')) {
    return {
      codigo: 'MOV-405',
      categoria: 'Móviles & Multiplataforma',
      creditos: 4,
      horario: 'Mar - Jue 14:00 - 16:30',
      fechaInicio: '17 de Agosto de 2026 (Ciclo 2026-II)',
      fechaFin: '18 de Diciembre de 2026 (Fin Semestre)'
    };
  } else {
    const defaultCats = [
      { cat: 'Desarrollo Web', cod: 'DAA-301', cred: 4, hor: 'Lun - Mie 19:00 - 21:30' },
      { cat: 'Backend & Cloud', cod: 'SW-402', cred: 5, hor: 'Mar - Jue 18:30 - 21:00' },
      { cat: 'Bases de Datos', cod: 'DB-204', cred: 3, hor: 'Sab 08:00 - 13:00' },
      { cat: 'Ciberseguridad', cod: 'SEC-501', cred: 4, hor: 'Vie 19:00 - 22:00' },
      { cat: 'Inteligencia Artificial', cod: 'IA-601', cred: 4, hor: 'Lun - Mie 14:00 - 16:30' },
      { cat: 'Móviles & Multiplataforma', cod: 'MOV-405', cred: 4, hor: 'Mar - Jue 14:00 - 16:30' }
    ];
    const item = defaultCats[(id - 1) % defaultCats.length];
    return {
      codigo: `CUR-${String(id).padStart(3, '0')}`,
      categoria: item.cat,
      creditos: item.cred,
      horario: item.hor,
      fechaInicio: '16 de Marzo de 2026 (Ciclo 2026-I)',
      fechaFin: '17 de Julio de 2026 (Fin Semestre)'
    };
  }
};

// Obtener todos los cursos
const getCursos = async (req, res, next) => {
  try {
    const { estudianteId, alumnoId } = req.query;
    let whereMatriculaJoin = '';
    let params = [];

    if (estudianteId || alumnoId) {
      const targetId = estudianteId || alumnoId;
      whereMatriculaJoin = `
        INNER JOIN matricula m_filter ON c.id_seccion = m_filter.id_seccion AND m_filter.estado = 1
        INNER JOIN alumno a_filter ON m_filter.id_alumno = a_filter.id_alumno AND (a_filter.id_usuario = ? OR a_filter.id_alumno = ?)
      `;
      params.push(targetId, targetId);
    }

    const sql = `
      SELECT 
        c.id_curso AS id,
        c.id_curso,
        c.nombre,
        COALESCE(c.descripcion, '') AS descripcion,
        c.estado,
        c.fecha_creacion,
        c.id_seccion,
        s.nombre_seccion,
        s.periodo_academico,
        s.capacidad_maxima AS cuposTotales,
        COALESCE(ac.id_docente, 0) AS docenteId,
        COALESCE(CONCAT(ud.nombre, ' ', ud.apellido), 'Sin Asignar') AS docenteNombre,
        (s.capacidad_maxima - (
          SELECT COUNT(*) FROM matricula m WHERE m.id_seccion = c.id_seccion AND m.estado = 1
        )) AS cuposDisponibles
      FROM curso c
      INNER JOIN seccion s ON c.id_seccion = s.id_seccion
      ${whereMatriculaJoin}
      LEFT JOIN asignacion_curso ac ON c.id_curso = ac.id_curso AND ac.estado = 1
      LEFT JOIN docente d ON ac.id_docente = d.id_docente
      LEFT JOIN usuario ud ON d.id_usuario = ud.id_usuario
      ORDER BY c.id_curso ASC
    `;
    const rows = await query(sql, params);

    const data = rows.map(r => {
      const meta = getCourseMeta(r.id_curso, r.nombre, r.descripcion);
      return {
        ...r,
        codigo: meta.codigo,
        categoria: meta.categoria,
        creditos: meta.creditos,
        horario: meta.horario,
        fechaInicio: meta.fechaInicio,
        fechaFin: meta.fechaFin,
        estado: Boolean(r.estado),
        cuposDisponibles: Math.max(0, Number(r.cuposDisponibles || r.cuposTotales))
      };
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Obtener cursos matriculados de un estudiante
const getCursosMatriculados = async (req, res, next) => {
  try {
    const { estudianteId } = req.params;
    const sql = `
      SELECT 
        c.id_curso AS id,
        c.id_curso,
        c.nombre,
        COALESCE(c.descripcion, '') AS descripcion,
        c.estado,
        c.fecha_creacion,
        c.id_seccion,
        s.nombre_seccion,
        s.periodo_academico,
        s.capacidad_maxima AS cuposTotales,
        COALESCE(ac.id_docente, 0) AS docenteId,
        COALESCE(CONCAT(ud.nombre, ' ', ud.apellido), 'Sin Asignar') AS docenteNombre,
        (s.capacidad_maxima - (
          SELECT COUNT(*) FROM matricula m WHERE m.id_seccion = c.id_seccion AND m.estado = 1
        )) AS cuposDisponibles
      FROM curso c
      INNER JOIN seccion s ON c.id_seccion = s.id_seccion
      INNER JOIN matricula m_filter ON c.id_seccion = m_filter.id_seccion AND m_filter.estado = 1
      INNER JOIN alumno a_filter ON m_filter.id_alumno = a_filter.id_alumno AND (a_filter.id_usuario = ? OR a_filter.id_alumno = ?)
      LEFT JOIN asignacion_curso ac ON c.id_curso = ac.id_curso AND ac.estado = 1
      LEFT JOIN docente d ON ac.id_docente = d.id_docente
      LEFT JOIN usuario ud ON d.id_usuario = ud.id_usuario
      ORDER BY c.id_curso ASC
    `;
    const rows = await query(sql, [estudianteId, estudianteId]);

    const data = rows.map(r => {
      const meta = getCourseMeta(r.id_curso, r.nombre, r.descripcion);
      return {
        ...r,
        codigo: meta.codigo,
        categoria: meta.categoria,
        creditos: meta.creditos,
        horario: meta.horario,
        fechaInicio: meta.fechaInicio,
        fechaFin: meta.fechaFin,
        estado: Boolean(r.estado),
        cuposDisponibles: Math.max(0, Number(r.cuposDisponibles || r.cuposTotales))
      };
    });

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Obtener un curso por ID
const getCursoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        c.id_curso AS id,
        c.id_curso,
        c.nombre,
        COALESCE(c.descripcion, '') AS descripcion,
        c.estado,
        c.fecha_creacion,
        c.id_seccion,
        s.nombre_seccion,
        s.periodo_academico,
        s.capacidad_maxima AS cuposTotales,
        COALESCE(ac.id_docente, 0) AS docenteId,
        COALESCE(CONCAT(ud.nombre, ' ', ud.apellido), 'Sin Asignar') AS docenteNombre
      FROM curso c
      INNER JOIN seccion s ON c.id_seccion = s.id_seccion
      LEFT JOIN asignacion_curso ac ON c.id_curso = ac.id_curso AND ac.estado = 1
      LEFT JOIN docente d ON ac.id_docente = d.id_docente
      LEFT JOIN usuario ud ON d.id_usuario = ud.id_usuario
      WHERE c.id_curso = ?
    `;
    const rows = await query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    }

    const r = rows[0];
    const meta = getCourseMeta(r.id_curso, r.nombre, r.descripcion);

    res.json({
      ...r,
      codigo: meta.codigo,
      categoria: meta.categoria,
      creditos: meta.creditos,
      horario: meta.horario,
      fechaInicio: meta.fechaInicio,
      fechaFin: meta.fechaFin,
      estado: Boolean(r.estado)
    });
  } catch (error) {
    next(error);
  }
};

// Crear curso
const createCurso = async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      codigo,
      creditos,
      horario,
      fechaInicio,
      fechaFin,
      id_seccion,
      docenteId,
      id_docente,
      estado = true
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre del curso es obligatorio.' });
    }

    let seccionId = id_seccion;
    if (!seccionId) {
      const secRows = await query('SELECT id_seccion FROM seccion LIMIT 1');
      seccionId = secRows.length > 0 ? secRows[0].id_seccion : 1;
    }

    const result = await query(`
      INSERT INTO curso (id_seccion, nombre, descripcion, estado)
      VALUES (?, ?, ?, ?)
    `, [seccionId, nombre, descripcion || '', estado ? 1 : 0]);

    const newCursoId = result.insertId;

    const assignedDocenteId = docenteId || id_docente;
    if (assignedDocenteId) {
      await query(`
        INSERT INTO asignacion_curso (id_docente, id_curso, estado)
        VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE id_docente = VALUES(id_docente), estado = 1
      `, [assignedDocenteId, newCursoId]);
    }

    const meta = getCourseMeta(newCursoId, nombre, descripcion, categoria, codigo, creditos, horario, fechaInicio, fechaFin);

    const created = await query(`
      SELECT 
        c.id_curso AS id,
        c.id_curso,
        c.nombre,
        c.descripcion,
        c.estado,
        c.id_seccion,
        s.nombre_seccion,
        s.capacidad_maxima AS cuposTotales,
        COALESCE(ac.id_docente, 0) AS docenteId,
        COALESCE(CONCAT(ud.nombre, ' ', ud.apellido), 'Sin Asignar') AS docenteNombre
      FROM curso c
      INNER JOIN seccion s ON c.id_seccion = s.id_seccion
      LEFT JOIN asignacion_curso ac ON c.id_curso = ac.id_curso AND ac.estado = 1
      LEFT JOIN docente d ON ac.id_docente = d.id_docente
      LEFT JOIN usuario ud ON d.id_usuario = ud.id_usuario
      WHERE c.id_curso = ?
    `, [newCursoId]);

    res.status(201).json({
      ...created[0],
      codigo: meta.codigo,
      categoria: meta.categoria,
      creditos: meta.creditos,
      horario: meta.horario,
      fechaInicio: meta.fechaInicio,
      fechaFin: meta.fechaFin,
      estado: Boolean(created[0].estado)
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar curso
const updateCurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      categoria,
      codigo,
      creditos,
      horario,
      fechaInicio,
      fechaFin,
      id_seccion,
      docenteId,
      id_docente,
      estado
    } = req.body;

    const cursoRows = await query('SELECT * FROM curso WHERE id_curso = ?', [id]);
    if (cursoRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    }

    const current = cursoRows[0];
    const newNombre = nombre !== undefined ? nombre : current.nombre;
    const newDescripcion = descripcion !== undefined ? descripcion : current.descripcion;
    const newSeccion = id_seccion !== undefined ? id_seccion : current.id_seccion;
    const newEstado = estado !== undefined ? (estado ? 1 : 0) : current.estado;

    await query(`
      UPDATE curso
      SET nombre = ?, descripcion = ?, id_seccion = ?, estado = ?
      WHERE id_curso = ?
    `, [newNombre, newDescripcion, newSeccion, newEstado, id]);

    const assignedDocenteId = docenteId || id_docente;
    if (assignedDocenteId !== undefined && assignedDocenteId !== null) {
      await query('DELETE FROM asignacion_curso WHERE id_curso = ?', [id]);
      if (Number(assignedDocenteId) > 0) {
        await query(`
          INSERT INTO asignacion_curso (id_docente, id_curso, estado)
          VALUES (?, ?, 1)
        `, [assignedDocenteId, id]);
      }
    }

    const meta = getCourseMeta(id, newNombre, newDescripcion, categoria, codigo, creditos, horario, fechaInicio, fechaFin);

    const updated = await query(`
      SELECT 
        c.id_curso AS id,
        c.id_curso,
        c.nombre,
        c.descripcion,
        c.estado,
        c.id_seccion,
        s.nombre_seccion,
        s.capacidad_maxima AS cuposTotales,
        COALESCE(ac.id_docente, 0) AS docenteId,
        COALESCE(CONCAT(ud.nombre, ' ', ud.apellido), 'Sin Asignar') AS docenteNombre
      FROM curso c
      INNER JOIN seccion s ON c.id_seccion = s.id_seccion
      LEFT JOIN asignacion_curso ac ON c.id_curso = ac.id_curso AND ac.estado = 1
      LEFT JOIN docente d ON ac.id_docente = d.id_docente
      LEFT JOIN usuario ud ON d.id_usuario = ud.id_usuario
      WHERE c.id_curso = ?
    `, [id]);

    res.json({
      ...updated[0],
      codigo: meta.codigo,
      categoria: meta.categoria,
      creditos: meta.creditos,
      horario: meta.horario,
      fechaInicio: meta.fechaInicio,
      fechaFin: meta.fechaFin,
      estado: Boolean(updated[0].estado)
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar curso
const deleteCurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM curso WHERE id_curso = ?', [id]);
    res.json({ success: true, message: 'Curso eliminado exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCursos,
  getCursosMatriculados,
  getCursoById,
  createCurso,
  updateCurso,
  deleteCurso
};
