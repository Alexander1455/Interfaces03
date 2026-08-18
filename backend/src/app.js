const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRoutes = require('./routes/index');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();

// Middlewares globales
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: '🎓 Bienvenido a la API REST del Sistema de Gestión Escolar Idat',
    documentation: '/api/health',
    version: '1.0.0'
  });
});

// Enrutador de la API REST
app.use('/api', apiRoutes);

// Manejo de rutas inexistentes y errores
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
