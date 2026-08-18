const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET } = require('../middlewares/auth.middleware');

// Iniciar sesión
const login = async (req, res, next) => {
  try {
    const email = req.body.email || req.body.correo;
    const clave = req.body.clave || req.body.password;

    if (!email || !clave) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar correo y contraseña.'
      });
    }

    const sql = `
      SELECT 
        u.id_usuario, u.dni, u.nombre, u.apellido, u.email, u.password_hash, u.estado,
        r.nombre_rol,
        d.id_docente, d.especialidad,
        a.id_alumno
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      LEFT JOIN docente d ON u.id_usuario = d.id_usuario
      LEFT JOIN alumno a ON u.id_usuario = a.id_usuario
      WHERE u.email = ?
      LIMIT 1
    `;

    const users = await query(sql, [email.trim().toLowerCase()]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Usuario no encontrado.'
      });
    }

    const user = users[0];

    if (!user.estado) {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta se encuentra inactiva. Contacta al administrador.'
      });
    }

    const isMatch = await bcrypt.compare(clave, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Contraseña incorrecta.'
      });
    }

    // Mapeo para frontend Angular (ADMIN, PROFESOR, ESTUDIANTE)
    let frontendRol = user.nombre_rol;
    if (frontendRol === 'DOCENTE') frontendRol = 'PROFESOR';
    if (frontendRol === 'ALUMNO') frontendRol = 'ESTUDIANTE';

    const nombreCompleto = `${user.nombre} ${user.apellido}`;
    const tokenPayload = {
      id: user.id_usuario,
      sub: user.email,
      nombre: nombreCompleto,
      email: user.email,
      rol: frontendRol,
      rolDb: user.nombre_rol,
      idDocente: user.id_docente || null,
      idAlumno: user.id_alumno || null
    };

    const expiraEn = 86400; // 24 horas en segundos
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    // Respuesta compatible con el cliente Angular y REST estándar
    return res.status(200).json({
      success: true,
      message: 'Autenticación exitosa',
      token,
      expiraEn,
      usuario: {
        id: user.id_usuario,
        nombre: nombreCompleto,
        email: user.email,
        rol: frontendRol,
        dni: user.dni,
        idDocente: user.id_docente || null,
        idAlumno: user.id_alumno || null,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nombreCompleto)}&background=0D8ABC&color=fff`
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT 
        u.id_usuario, u.dni, u.nombre, u.apellido, u.email, u.estado, u.fecha_creacion,
        r.nombre_rol, r.descripcion AS rol_descripcion,
        d.id_docente, d.especialidad, d.grado_academico, d.telefono AS telefono_docente,
        a.id_alumno, a.dni_apoderado, a.telefono AS telefono_alumno, a.fecha_nacimiento
      FROM usuario u
      INNER JOIN rol r ON u.id_rol = r.id_rol
      LEFT JOIN docente d ON u.id_usuario = d.id_usuario
      LEFT JOIN alumno a ON u.id_usuario = a.id_usuario
      WHERE u.id_usuario = ?
    `;
    const users = await query(sql, [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const u = users[0];
    let frontendRol = u.nombre_rol;
    if (frontendRol === 'DOCENTE') frontendRol = 'PROFESOR';
    if (frontendRol === 'ALUMNO') frontendRol = 'ESTUDIANTE';

    res.json({
      success: true,
      usuario: {
        id: u.id_usuario,
        dni: u.dni,
        nombre: u.nombre,
        apellido: u.apellido,
        nombreCompleto: `${u.nombre} ${u.apellido}`,
        email: u.email,
        rol: frontendRol,
        rolDb: u.nombre_rol,
        estado: Boolean(u.estado),
        fechaCreacion: u.fecha_creacion,
        detallesDocente: u.id_docente ? {
          idDocente: u.id_docente,
          especialidad: u.especialidad,
          gradoAcademico: u.grado_academico,
          telefono: u.telefono_docente
        } : null,
        detallesAlumno: u.id_alumno ? {
          idAlumno: u.id_alumno,
          dniApoderado: u.dni_apoderado,
          telefono: u.telefono_alumno,
          fechaNacimiento: u.fecha_nacimiento
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getProfile
};
