const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_idat_jwt_key_2026_academic_portal';

// Mapeo flexible de roles para interoperabilidad con frontend Angular (PROFESOR/DOCENTE, ESTUDIANTE/ALUMNO)
const normalizeRole = (role) => {
  if (!role) return '';
  const r = role.toUpperCase();
  if (r === 'PROFESOR') return 'DOCENTE';
  if (r === 'ESTUDIANTE') return 'ALUMNO';
  return r;
};

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Token no proporcionado.'
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Formato de token inválido. Se espera: Bearer <token>'
      });
    }

    const token = parts[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'El token ha expirado. Por favor, inicie sesión nuevamente.'
          });
        }
        return res.status(403).json({
          success: false,
          message: 'Token de autenticación inválido.'
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error verificando autenticación.',
      error: error.message
    });
  }
};

const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(403).json({
        success: false,
        message: 'No tienes un rol asignado para realizar esta acción.'
      });
    }

    const userRole = normalizeRole(req.user.rol);
    const normalizedAllowed = allowedRoles.map(normalizeRole);

    if (!normalizedAllowed.includes(userRole) && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  requireRole,
  normalizeRole,
  JWT_SECRET
};
