const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

// Obtener todos los usuarios
const getUsuarios = async (req, res, next) => {
  try {
    const sql = `
      SELECT 
        u.id_usuario AS id,
        u.dni,
        u.dni AS codigoInstitucional,
        u.nombre,
        u.apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS nombreCompleto,
        u.email,
        u.estado,
        u.fecha_creacion AS fechaCreacion,
        r.id_rol,
        r.nombre_rol,
        CASE 
          WHEN r.nombre_rol = 'DOCENTE' THEN 'PROFESOR'
          WHEN r.nombre_rol = 'ALUMNO' THEN 'ESTUDIANTE'
          ELSE r.nombre_rol
        END AS rol,
        COALESCE(d.telefono, a.telefono, '') AS telefono,
        d.especialidad,
        d.grado_academico,
        a.dni_apoderado,
        a.fecha_nacimiento
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      LEFT JOIN docente d ON u.id_usuario = d.id_usuario
      LEFT JOIN alumno a ON u.id_usuario = a.id_usuario
      ORDER BY u.id_usuario DESC
    `;
    const rows = await query(sql);
    
    // Normalizar estado como booleano para Angular
    const data = rows.map(r => ({
      ...r,
      estado: Boolean(r.estado)
    }));

    res.json(data);
  } catch (error) {
    next(error);
  }
};

// Obtener un usuario por ID
const getUsuarioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        u.id_usuario AS id,
        u.dni,
        u.dni AS codigoInstitucional,
        u.nombre,
        u.apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS nombreCompleto,
        u.email,
        u.estado,
        u.fecha_creacion AS fechaCreacion,
        r.id_rol,
        r.nombre_rol,
        CASE 
          WHEN r.nombre_rol = 'DOCENTE' THEN 'PROFESOR'
          WHEN r.nombre_rol = 'ALUMNO' THEN 'ESTUDIANTE'
          ELSE r.nombre_rol
        END AS rol,
        COALESCE(d.telefono, a.telefono, '') AS telefono,
        d.especialidad,
        d.grado_academico,
        a.dni_apoderado,
        a.fecha_nacimiento
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      LEFT JOIN docente d ON u.id_usuario = d.id_usuario
      LEFT JOIN alumno a ON u.id_usuario = a.id_usuario
      WHERE u.id_usuario = ?
    `;
    const rows = await query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    const user = { ...rows[0], estado: Boolean(rows[0].estado) };
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Crear usuario
const createUsuario = async (req, res, next) => {
  try {
    const {
      nombre,
      apellido,
      nombreCompleto,
      email,
      clave,
      password,
      dni,
      codigoInstitucional,
      rol,
      id_rol,
      estado = true,
      telefono,
      especialidad,
      grado_academico,
      dni_apoderado,
      fecha_nacimiento
    } = req.body;

    // Procesar nombre y apellido
    let finalNombre = nombre;
    let finalApellido = apellido;
    if (!finalNombre && nombreCompleto) {
      const parts = nombreCompleto.trim().split(' ');
      finalNombre = parts[0];
      finalApellido = parts.slice(1).join(' ') || '-';
    }

    const finalDni = (dni || codigoInstitucional || '').trim();
    const finalEmail = (email || '').trim().toLowerCase();
    const finalPassword = clave || password || '123456';

    if (!finalNombre || !finalEmail || !finalDni) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, Email y DNI/Código son requeridos.'
      });
    }

    // Resolver ID de rol
    let resolvedRolId = id_rol;
    if (!resolvedRolId && rol) {
      const rolName = rol.toUpperCase() === 'PROFESOR' ? 'DOCENTE' : (rol.toUpperCase() === 'ESTUDIANTE' ? 'ALUMNO' : rol.toUpperCase());
      const rolRows = await query('SELECT id_rol FROM rol WHERE nombre_rol = ? LIMIT 1', [rolName]);
      if (rolRows.length > 0) {
        resolvedRolId = rolRows[0].id_rol;
      }
    }
    if (!resolvedRolId) resolvedRolId = 3; // Por defecto Alumno

    // Validar duplicados
    const existing = await query('SELECT id_usuario FROM usuario WHERE email = ? OR dni = ?', [finalEmail, finalDni]);
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario registrado con este DNI o Correo electrónico.'
      });
    }

    const hash = await bcrypt.hash(finalPassword, 10);

    const result = await query(`
      INSERT INTO usuario (dni, nombre, apellido, email, password_hash, estado, id_rol)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [finalDni, finalNombre, finalApellido || '', finalEmail, hash, estado ? 1 : 0, resolvedRolId]);

    const newUserId = result.insertId;

    // Crear registro en docente o alumno según corresponda
    if (resolvedRolId === 2) {
      await query(`
        INSERT INTO docente (id_usuario, especialidad, grado_academico, telefono)
        VALUES (?, ?, ?, ?)
      `, [newUserId, especialidad || 'Docencia General', grado_academico || 'Licenciatura', telefono || null]);
    } else if (resolvedRolId === 3) {
      await query(`
        INSERT INTO alumno (id_usuario, dni_apoderado, telefono, fecha_nacimiento)
        VALUES (?, ?, ?, ?)
      `, [newUserId, dni_apoderado || null, telefono || null, fecha_nacimiento || null]);
    }

    // Retornar usuario creado
    const created = await query(`
      SELECT 
        u.id_usuario AS id,
        u.dni,
        u.dni AS codigoInstitucional,
        u.nombre,
        u.apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS nombreCompleto,
        u.email,
        u.estado,
        u.fecha_creacion AS fechaCreacion,
        r.nombre_rol,
        CASE 
          WHEN r.nombre_rol = 'DOCENTE' THEN 'PROFESOR'
          WHEN r.nombre_rol = 'ALUMNO' THEN 'ESTUDIANTE'
          ELSE r.nombre_rol
        END AS rol,
        COALESCE(d.telefono, a.telefono, '') AS telefono
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      LEFT JOIN docente d ON u.id_usuario = d.id_usuario
      LEFT JOIN alumno a ON u.id_usuario = a.id_usuario
      WHERE u.id_usuario = ?
    `, [newUserId]);

    res.status(201).json({
      ...created[0],
      estado: Boolean(created[0].estado)
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar usuario
const updateUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      nombreCompleto,
      email,
      clave,
      password,
      dni,
      codigoInstitucional,
      rol,
      id_rol,
      estado,
      telefono
    } = req.body;

    const userRows = await query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    let finalNombre = nombre;
    let finalApellido = apellido;
    if (nombreCompleto) {
      const parts = nombreCompleto.trim().split(' ');
      finalNombre = parts[0];
      finalApellido = parts.slice(1).join(' ') || '';
    }

    const current = userRows[0];
    const newNombre = finalNombre !== undefined ? finalNombre : current.nombre;
    const newApellido = finalApellido !== undefined ? finalApellido : current.apellido;
    const newEmail = email !== undefined ? email.trim().toLowerCase() : current.email;
    const newDni = (dni || codigoInstitucional) !== undefined ? (dni || codigoInstitucional).trim() : current.dni;
    const newEstado = estado !== undefined ? (estado ? 1 : 0) : current.estado;

    let newRolId = current.id_rol;
    if (id_rol) {
      newRolId = id_rol;
    } else if (rol) {
      const rolName = rol.toUpperCase() === 'PROFESOR' ? 'DOCENTE' : (rol.toUpperCase() === 'ESTUDIANTE' ? 'ALUMNO' : rol.toUpperCase());
      const rolRows = await query('SELECT id_rol FROM rol WHERE nombre_rol = ? LIMIT 1', [rolName]);
      if (rolRows.length > 0) newRolId = rolRows[0].id_rol;
    }

    let newHash = current.password_hash;
    if (clave || password) {
      newHash = await bcrypt.hash(clave || password, 10);
    }

    await query(`
      UPDATE usuario
      SET dni = ?, nombre = ?, apellido = ?, email = ?, password_hash = ?, estado = ?, id_rol = ?
      WHERE id_usuario = ?
    `, [newDni, newNombre, newApellido, newEmail, newHash, newEstado, newRolId, id]);

    // Actualizar teléfono en perfiles docente/alumno si vino en la petición
    if (telefono !== undefined) {
      await query('UPDATE docente SET telefono = ? WHERE id_usuario = ?', [telefono, id]);
      await query('UPDATE alumno SET telefono = ? WHERE id_usuario = ?', [telefono, id]);
    }

    const updated = await query(`
      SELECT 
        u.id_usuario AS id,
        u.dni,
        u.dni AS codigoInstitucional,
        u.nombre,
        u.apellido,
        CONCAT(u.nombre, ' ', u.apellido) AS nombreCompleto,
        u.email,
        u.estado,
        u.fecha_creacion AS fechaCreacion,
        r.nombre_rol,
        CASE 
          WHEN r.nombre_rol = 'DOCENTE' THEN 'PROFESOR'
          WHEN r.nombre_rol = 'ALUMNO' THEN 'ESTUDIANTE'
          ELSE r.nombre_rol
        END AS rol,
        COALESCE(d.telefono, a.telefono, '') AS telefono
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      LEFT JOIN docente d ON u.id_usuario = d.id_usuario
      LEFT JOIN alumno a ON u.id_usuario = a.id_usuario
      WHERE u.id_usuario = ?
    `, [id]);

    res.json({
      ...updated[0],
      estado: Boolean(updated[0].estado)
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar usuario
const deleteUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRows = await query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Borrado en cascada por foreign keys en docente/alumno
    await query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario
};
