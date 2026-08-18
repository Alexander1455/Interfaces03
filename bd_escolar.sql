-- ==========================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS ESCOLAR (MySQL)
-- ==========================================================

DROP DATABASE IF EXISTS bd_escolar;
CREATE DATABASE bd_escolar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bd_escolar;

-- ----------------------------------------------------------
-- 1. TABLA: rol
-- ----------------------------------------------------------
CREATE TABLE rol (
    id_rol INT AUTO_INCREMENT,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL,
    CONSTRAINT pk_rol PRIMARY KEY (id_rol)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. TABLA: usuario
-- ----------------------------------------------------------
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT,
    dni VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_rol INT NOT NULL,
    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
    CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) 
        REFERENCES rol (id_rol) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. TABLA: docente
-- ----------------------------------------------------------
CREATE TABLE docente (
    id_docente INT AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    especialidad VARCHAR(100) NOT NULL,
    grado_academico VARCHAR(100) NULL,
    telefono VARCHAR(20) NULL,
    CONSTRAINT pk_docente PRIMARY KEY (id_docente),
    CONSTRAINT fk_docente_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario (id_usuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. TABLA: alumno
-- ----------------------------------------------------------
CREATE TABLE alumno (
    id_alumno INT AUTO_INCREMENT,
    id_usuario INT NOT NULL UNIQUE,
    dni_apoderado VARCHAR(20) NULL,
    telefono VARCHAR(20) NULL,
    fecha_nacimiento DATE NULL,
    CONSTRAINT pk_alumno PRIMARY KEY (id_alumno),
    CONSTRAINT fk_alumno_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario (id_usuario) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. TABLA: seccion
-- ----------------------------------------------------------
CREATE TABLE seccion (
    id_seccion INT AUTO_INCREMENT,
    nombre_seccion VARCHAR(50) NOT NULL,
    periodo_academico VARCHAR(50) NOT NULL,
    capacidad_maxima INT NOT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT pk_seccion PRIMARY KEY (id_seccion),
    CONSTRAINT chk_seccion_capacidad CHECK (capacidad_maxima > 0)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. TABLA: curso
-- ----------------------------------------------------------
CREATE TABLE curso (
    id_curso INT AUTO_INCREMENT,
    id_seccion INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_curso PRIMARY KEY (id_curso),
    CONSTRAINT fk_curso_seccion FOREIGN KEY (id_seccion) 
        REFERENCES seccion (id_seccion) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. TABLA: matricula
-- ----------------------------------------------------------
CREATE TABLE matricula (
    id_matricula INT AUTO_INCREMENT,
    id_alumno INT NOT NULL,
    id_seccion INT NOT NULL,
    fecha_matricula DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    CONSTRAINT pk_matricula PRIMARY KEY (id_matricula),
    CONSTRAINT fk_matricula_alumno FOREIGN KEY (id_alumno) 
        REFERENCES alumno (id_alumno) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_matricula_seccion FOREIGN KEY (id_seccion) 
        REFERENCES seccion (id_seccion) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT uq_alumno_seccion UNIQUE (id_alumno, id_seccion)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 8. TABLA: asignacion_curso
-- ----------------------------------------------------------
CREATE TABLE asignacion_curso (
    id_asignacion INT AUTO_INCREMENT,
    id_docente INT NOT NULL,
    id_curso INT NOT NULL,
    estado TINYINT(1) NOT NULL DEFAULT 1,
    fecha_asignacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_asignacion PRIMARY KEY (id_asignacion),
    CONSTRAINT fk_asignacion_docente FOREIGN KEY (id_docente) 
        REFERENCES docente (id_docente) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_asignacion_curso FOREIGN KEY (id_curso) 
        REFERENCES curso (id_curso) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT uq_docente_curso UNIQUE (id_docente, id_curso)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 9. TABLA: nota_curso
-- ----------------------------------------------------------
CREATE TABLE nota_curso (
    id_nota INT AUTO_INCREMENT,
    id_curso INT NOT NULL,
    id_alumno INT NOT NULL,
    nombre_evaluacion VARCHAR(100) NOT NULL,
    calificacion DECIMAL(5,2) NOT NULL,
    ponderacion DECIMAL(5,2) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_nota_curso PRIMARY KEY (id_nota),
    CONSTRAINT fk_nota_curso FOREIGN KEY (id_curso) 
        REFERENCES curso (id_curso) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_nota_alumno FOREIGN KEY (id_alumno) 
        REFERENCES alumno (id_alumno) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_calificacion CHECK (calificacion >= 0.00 AND calificacion <= 20.00),
    CONSTRAINT chk_ponderacion CHECK (ponderacion >= 0.00 AND ponderacion <= 100.00)
) ENGINE=InnoDB;

-- ==========================================================
-- INSERCIÓN DE DATOS INICIALES EN LAS 9 TABLAS
-- ==========================================================

-- 1. Roles
INSERT INTO rol (id_rol, nombre_rol, descripcion) VALUES 
(1, 'ADMIN', 'Administrador del sistema escolar con acceso total'),
(2, 'DOCENTE', 'Profesor o instructor académico con acceso a gestión académica'),
(3, 'ALUMNO', 'Estudiante matriculado con acceso a consultas y matrícula');

-- 2. Usuarios (Contraseñas encriptadas con bcrypt: admin123, prof123, est123)
INSERT INTO usuario (id_usuario, dni, nombre, apellido, email, password_hash, estado, id_rol) VALUES 
(1, '70000001', 'Alexander', 'Director General', 'admin@idat.edu.pe', '$2a$10$h7hAB5hb4upV.SULXkbAsuyOJdOFgX/m3j9ZkUmk0qlVwNwWTLQ5W', 1, 1),
(2, '70000002', 'Carlos', 'Mendoza Vargas', 'profesor@idat.edu.pe', '$2a$10$nZ692WwC0IstqURJd5ofPOcXbtlEQnCouRtxSAU5JOcEVhH8vsg7.', 1, 2),
(3, '70000003', 'Valeria', 'Quispe Ramos', 'estudiante@idat.edu.pe', '$2a$10$W42ARCnKsgS4z2QJtdq6ZurI0MBDFbEsi8pfYA0c1.qW5WdHp5NzW', 1, 3),
(4, '70000004', 'Maria', 'Fernández Soto', 'mfernandez@idat.edu.pe', '$2a$10$nZ692WwC0IstqURJd5ofPOcXbtlEQnCouRtxSAU5JOcEVhH8vsg7.', 1, 2),
(5, '70000005', 'Juan', 'Pérez Salazar', 'jperez@idat.edu.pe', '$2a$10$W42ARCnKsgS4z2QJtdq6ZurI0MBDFbEsi8pfYA0c1.qW5WdHp5NzW', 1, 3);

-- 3. Docentes
INSERT INTO docente (id_docente, id_usuario, especialidad, grado_academico, telefono) VALUES 
(1, 2, 'Desarrollo de Software y Arquitectura Web', 'Magíster en Ing. de Sistemas', '998877661'),
(2, 4, 'Bases de Datos & Cloud Computing', 'Ingeniera de Sistemas e Informática', '998877662');

-- 4. Alumnos
INSERT INTO alumno (id_alumno, id_usuario, dni_apoderado, telefono, fecha_nacimiento) VALUES 
(1, 3, '40112233', '987654321', '2004-05-15'),
(2, 5, '40998877', '987112233', '2003-11-20');

-- 5. Secciones
INSERT INTO seccion (id_seccion, nombre_seccion, periodo_academico, capacidad_maxima, estado) VALUES 
(1, 'SECCION-A (Mañana)', '2026-I', 30, 1),
(2, 'SECCION-B (Noche)', '2026-I', 25, 1),
(3, 'SECCION-C (Virtual)', '2026-I', 40, 1);

-- 6. Cursos
INSERT INTO curso (id_curso, id_seccion, nombre, descripcion, estado) VALUES 
(1, 1, 'Desarrollo de Interfaces 3 (Angular + Node)', 'Desarrollo de SPAs con Angular, Componentes, Guards, Pipes y JWT', 1),
(2, 1, 'Base de Datos Avanzada (MySQL & NoSQL)', 'Diseño relacional, normalización, transacciones y procedimientos', 1),
(3, 2, 'Arquitectura de Software y Microservicios', 'Patrones de arquitectura, RESTful APIs, Spring Boot y Node.js', 1),
(4, 3, 'Seguridad en Aplicaciones Web', 'Autenticación JWT, OAuth2, encriptación y protección contra vulnerabilidades', 1);

-- 7. Matrícula
INSERT INTO matricula (id_matricula, id_alumno, id_seccion, estado) VALUES 
(1, 1, 1, 1),
(2, 2, 1, 1),
(3, 1, 2, 1);

-- 8. Asignación de Docente a Cursos
INSERT INTO asignacion_curso (id_asignacion, id_docente, id_curso, estado) VALUES 
(1, 1, 1, 1),
(2, 2, 2, 1),
(3, 1, 3, 1),
(4, 2, 4, 1);

-- 9. Notas de Curso
INSERT INTO nota_curso (id_nota, id_curso, id_alumno, nombre_evaluacion, calificacion, ponderacion) VALUES 
(1, 1, 1, 'Evaluación Continua 1 (EC1)', 18.50, 20.00),
(2, 1, 1, 'Evaluación Continua 2 (EC2)', 17.00, 20.00),
(3, 1, 1, 'Evaluación Continua 3 (EC3)', 19.00, 20.00),
(4, 1, 1, 'Examen Final (EF)', 18.00, 40.00),
(5, 1, 2, 'Evaluación Continua 1 (EC1)', 14.00, 20.00),
(6, 1, 2, 'Evaluación Continua 2 (EC2)', 15.50, 20.00),
(7, 2, 1, 'Evaluación Continua 1 (EC1)', 16.00, 20.00);
