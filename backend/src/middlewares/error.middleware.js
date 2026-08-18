const errorHandler = (err, req, res, next) => {
  console.error('🔥 [Error Middleware]:', err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
