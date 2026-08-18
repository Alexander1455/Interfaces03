import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthResponse, LoginRequest, UserRole } from '../models/auth.model';
import { Usuario, UsuarioCreateDto, UsuarioUpdateDto } from '../models/usuario.model';
import { Curso, CursoCreateDto, CursoUpdateDto, Matricula, ActualizarNotaItemDto } from '../models/curso.model';

@Injectable({
  providedIn: 'root'
})
export class MockBackendService {
  private readonly USERS_KEY = 'idat_academic_users';
  private readonly COURSES_KEY = 'idat_academic_courses';
  private readonly ENROLLMENTS_KEY = 'idat_academic_enrollments';

  private defaultEnrollments: Matricula[] = [
    // Curso 1: Desarrollo de Interfaces 3 (Docente: Dra. María Rodríguez)
    {
      id: 1,
      estudianteId: 3,
      cursoId: 1,
      fechaMatricula: '2026-03-05',
      notaEC1: 17,
      notaEC2: 16,
      notaEC3: 18,
      notaEF: 17,
      promedioFinal: 17.0,
      estadoAcademico: 'APROBADO',
      observaciones: 'Excelente desempeño en Angular y TypeScript.'
    },
    {
      id: 2,
      estudianteId: 5,
      cursoId: 1,
      fechaMatricula: '2026-03-10',
      notaEC1: 15,
      notaEC2: 14,
      notaEC3: 16,
      notaEF: 15,
      promedioFinal: 15.0,
      estadoAcademico: 'APROBADO',
      observaciones: 'Buen trabajo en los componentes reactivos.'
    },
    {
      id: 3,
      estudianteId: 6,
      cursoId: 1,
      fechaMatricula: '2026-03-11',
      notaEC1: 18,
      notaEC2: 19,
      notaEC3: 18,
      notaEF: 19,
      promedioFinal: 18.6,
      estadoAcademico: 'APROBADO',
      observaciones: 'Sobresaliente dominio de Guards e Interceptores JWT.'
    },
    {
      id: 4,
      estudianteId: 7,
      cursoId: 1,
      fechaMatricula: '2026-03-12',
      notaEC1: 11,
      notaEC2: 10,
      notaEC3: 12,
      notaEF: 10,
      promedioFinal: 10.6,
      estadoAcademico: 'DESAPROBADO',
      observaciones: 'Requiere reforzar programación asíncrona con RxJS.'
    },
    {
      id: 5,
      estudianteId: 8,
      cursoId: 1,
      fechaMatricula: '2026-03-13',
      notaEC1: 16,
      notaEC2: 15,
      notaEC3: null,
      notaEF: null,
      promedioFinal: 15.5,
      estadoAcademico: 'EN_CURSO',
      observaciones: 'Evaluaciones continuas en progreso.'
    },
    {
      id: 6,
      estudianteId: 9,
      cursoId: 1,
      fechaMatricula: '2026-03-14',
      notaEC1: 14,
      notaEC2: 16,
      notaEC3: 15,
      notaEF: 16,
      promedioFinal: 15.4,
      estadoAcademico: 'APROBADO',
      observaciones: 'Participativo y puntual en entregas.'
    },

    // Curso 2: Arquitectura de Microservicios con Spring Boot (Docente: Ing. Roberto Silva)
    {
      id: 7,
      estudianteId: 3,
      cursoId: 2,
      fechaMatricula: '2026-03-06',
      notaEC1: 15,
      notaEC2: 16,
      notaEC3: 15,
      notaEF: 16,
      promedioFinal: 15.6,
      estadoAcademico: 'APROBADO',
      observaciones: 'Buen modelado de APIs RESTful.'
    },
    {
      id: 8,
      estudianteId: 10,
      cursoId: 2,
      fechaMatricula: '2026-03-10',
      notaEC1: 18,
      notaEC2: 17,
      notaEC3: 19,
      notaEF: 18,
      promedioFinal: 18.0,
      estadoAcademico: 'APROBADO',
      observaciones: 'Excelente implementación de Docker y Spring Security.'
    },
    {
      id: 9,
      estudianteId: 11,
      cursoId: 2,
      fechaMatricula: '2026-03-11',
      notaEC1: 13,
      notaEC2: 12,
      notaEC3: 14,
      notaEF: 13,
      promedioFinal: 13.0,
      estadoAcademico: 'APROBADO',
      observaciones: 'Aprobado satisfactoriamente.'
    },
    {
      id: 10,
      estudianteId: 12,
      cursoId: 2,
      fechaMatricula: '2026-03-12',
      notaEC1: 16,
      notaEC2: 17,
      notaEC3: null,
      notaEF: null,
      promedioFinal: 16.5,
      estadoAcademico: 'EN_CURSO',
      observaciones: 'Pendiente entrega de examen final.'
    },

    // Curso 3: Bases de Datos Relacionales y NoSQL (Docente: Dra. María Rodríguez)
    {
      id: 11,
      estudianteId: 5,
      cursoId: 3,
      fechaMatricula: '2026-03-08',
      notaEC1: 18,
      notaEC2: 17,
      notaEC3: 19,
      notaEF: 18,
      promedioFinal: 18.0,
      estadoAcademico: 'APROBADO',
      observaciones: 'Gran dominio de consultas complejas y MongoDB.'
    },
    {
      id: 12,
      estudianteId: 7,
      cursoId: 3,
      fechaMatricula: '2026-03-09',
      notaEC1: 14,
      notaEC2: 15,
      notaEC3: 13,
      notaEF: 14,
      promedioFinal: 13.9,
      estadoAcademico: 'APROBADO',
      observaciones: 'Cumplió los objetivos del curso.'
    },
    {
      id: 13,
      estudianteId: 9,
      cursoId: 3,
      fechaMatricula: '2026-03-10',
      notaEC1: 17,
      notaEC2: 16,
      notaEC3: 17,
      notaEF: 17,
      promedioFinal: 16.8,
      estadoAcademico: 'APROBADO',
      observaciones: 'Muy buen trabajo en indexación SQL.'
    },
    {
      id: 14,
      estudianteId: 13,
      cursoId: 3,
      fechaMatricula: '2026-03-11',
      notaEC1: 11,
      notaEC2: 12,
      notaEC3: 11,
      notaEF: 11,
      promedioFinal: 11.2,
      estadoAcademico: 'DESAPROBADO',
      observaciones: 'Debe reforzar optimización de consultas SQL.'
    },

    // Curso 4: Seguridad en Aplicaciones Web & JWT (Docente: Ing. Roberto Silva)
    {
      id: 15,
      estudianteId: 6,
      cursoId: 4,
      fechaMatricula: '2026-03-07',
      notaEC1: 19,
      notaEC2: 19,
      notaEC3: 20,
      notaEF: 19,
      promedioFinal: 19.2,
      estadoAcademico: 'APROBADO',
      observaciones: 'Excelente proyecto de mitigación de vulnerabilidades OWASP.'
    },
    {
      id: 16,
      estudianteId: 8,
      cursoId: 4,
      fechaMatricula: '2026-03-08',
      notaEC1: 15,
      notaEC2: 16,
      notaEC3: 16,
      notaEF: 15,
      promedioFinal: 15.4,
      estadoAcademico: 'APROBADO',
      observaciones: 'Muy buen trabajo en interceptores HTTP.'
    },
    {
      id: 17,
      estudianteId: 10,
      cursoId: 4,
      fechaMatricula: '2026-03-09',
      notaEC1: 14,
      notaEC2: 15,
      notaEC3: 14,
      notaEF: 15,
      promedioFinal: 14.6,
      estadoAcademico: 'APROBADO',
      observaciones: 'Aprobado satisfactoriamente.'
    },
    {
      id: 18,
      estudianteId: 13,
      cursoId: 4,
      fechaMatricula: '2026-03-10',
      notaEC1: 16,
      notaEC2: 16,
      notaEC3: 17,
      notaEF: 16,
      promedioFinal: 16.2,
      estadoAcademico: 'APROBADO',
      observaciones: 'Buen análisis de tokens y criptografía.'
    }
  ];

  private defaultUsers: Usuario[] = [
    {
      id: 1,
      nombreCompleto: 'Alexander García (Administrador)',
      email: 'admin@idat.edu.pe',
      rol: 'ADMIN',
      codigoInstitucional: 'ADM-2026-01',
      estado: true,
      telefono: '+51 987 654 321',
      fechaCreacion: '2026-01-15'
    },
    {
      id: 2,
      nombreCompleto: 'Dra. María Rodríguez (Docente)',
      email: 'profesor@idat.edu.pe',
      rol: 'PROFESOR',
      codigoInstitucional: 'DOC-1004-92',
      estado: true,
      telefono: '+51 912 345 678',
      fechaCreacion: '2026-02-10'
    },
    {
      id: 3,
      nombreCompleto: 'Carlos Mendoza (Estudiante)',
      email: 'estudiante@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-8841-20',
      estado: true,
      telefono: '+51 998 712 334',
      fechaCreacion: '2026-03-01'
    },
    {
      id: 4,
      nombreCompleto: 'Ing. Roberto Silva (Docente)',
      email: 'rsilva@idat.edu.pe',
      rol: 'PROFESOR',
      codigoInstitucional: 'DOC-1005-14',
      estado: true,
      telefono: '+51 933 221 445',
      fechaCreacion: '2026-02-20'
    },
    {
      id: 5,
      nombreCompleto: 'Lucía Fernández (Estudiante)',
      email: 'lfernandez@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-9122-31',
      estado: true,
      telefono: '+51 944 556 677',
      fechaCreacion: '2026-03-12'
    },
    {
      id: 6,
      nombreCompleto: 'Andrea Morales Vásquez (Estudiante)',
      email: 'amorales@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-9201-15',
      estado: true,
      telefono: '+51 955 667 788',
      fechaCreacion: '2026-03-13'
    },
    {
      id: 7,
      nombreCompleto: 'Diego Quispe Ramírez (Estudiante)',
      email: 'dquispe@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-9340-22',
      estado: true,
      telefono: '+51 966 778 899',
      fechaCreacion: '2026-03-14'
    },
    {
      id: 8,
      nombreCompleto: 'Valeria Torres Sánchez (Estudiante)',
      email: 'vtorres@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-9411-08',
      estado: true,
      telefono: '+51 977 889 900',
      fechaCreacion: '2026-03-15'
    },
    {
      id: 9,
      nombreCompleto: 'Mateo Huamán Castillo (Estudiante)',
      email: 'mhuaman@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-9520-44',
      estado: true,
      telefono: '+51 988 990 011',
      fechaCreacion: '2026-03-16'
    },
    {
      id: 10,
      nombreCompleto: 'Camila Flores Benítez (Estudiante)',
      email: 'cflores@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-9630-51',
      estado: true,
      telefono: '+51 911 223 344',
      fechaCreacion: '2026-03-17'
    },
    {
      id: 11,
      nombreCompleto: 'Sebastián Ramos Paredes (Estudiante)',
      email: 'sramos@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-9740-63',
      estado: true,
      telefono: '+51 922 334 455',
      fechaCreacion: '2026-03-18'
    },
    {
      id: 12,
      nombreCompleto: 'Gabriela Chávez Medina (Estudiante)',
      email: 'gchavez@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-9850-77',
      estado: true,
      telefono: '+51 933 445 566',
      fechaCreacion: '2026-03-19'
    },
    {
      id: 13,
      nombreCompleto: 'Joaquín Espinoza Rojas (Estudiante)',
      email: 'jespinoza@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-9960-89',
      estado: true,
      telefono: '+51 944 556 678',
      fechaCreacion: '2026-03-20'
    }
  ];

  private defaultCourses: Curso[] = [
    {
      id: 1,
      codigo: 'DAA-301',
      nombre: 'Desarrollo de Interfaces 3',
      descripcion: 'Desarrollo de Single Page Applications con Angular, TypeScript, enrutamiento avanzado, Guards y autenticación JWT.',
      categoria: 'Desarrollo Web',
      creditos: 4,
      docenteId: 2,
      docenteNombre: 'Dra. María Rodríguez',
      cuposDisponibles: 18,
      cuposTotales: 30,
      estado: true,
      horario: 'Lun - Mie 19:00 - 21:30',
      fechaInicio: '16 de Marzo de 2026 (Ciclo 2026-I)',
      fechaFin: '17 de Julio de 2026 (Fin Semestre)'
    },
    {
      id: 2,
      codigo: 'SW-402',
      nombre: 'Arquitectura de Microservicios con Spring Boot',
      descripcion: 'Diseño e implementación de servicios RESTful, Spring Security, JWT, Spring Data JPA y despliegue en contenedores Docker.',
      categoria: 'Backend & Cloud',
      creditos: 5,
      docenteId: 4,
      docenteNombre: 'Ing. Roberto Silva',
      cuposDisponibles: 12,
      cuposTotales: 25,
      estado: true,
      horario: 'Mar - Jue 18:30 - 21:00',
      fechaInicio: '01 de Abril de 2026 (Ciclo 2026-I)',
      fechaFin: '31 de Julio de 2026 (Fin Evaluaciones)'
    },
    {
      id: 3,
      codigo: 'DB-204',
      nombre: 'Bases de Datos Relacionales y NoSQL',
      descripcion: 'Optimización de consultas SQL, modelado de bases de datos relacionales en MySQL y persistencia NoSQL en MongoDB.',
      categoria: 'Bases de Datos',
      creditos: 3,
      docenteId: 2,
      docenteNombre: 'Dra. María Rodríguez',
      cuposDisponibles: 22,
      cuposTotales: 35,
      estado: true,
      horario: 'Sab 08:00 - 13:00',
      fechaInicio: '04 de Mayo de 2026 (Ciclo Modular)',
      fechaFin: '18 de Diciembre de 2026 (Fin Semestre)'
    },
    {
      id: 4,
      codigo: 'SEC-501',
      nombre: 'Seguridad en Aplicaciones Web & JWT',
      descripcion: 'Implementación de OAuth2, interceptores de autorización, prevención de vulnerabilidades OWASP y criptografía.',
      categoria: 'Ciberseguridad',
      creditos: 4,
      docenteId: 4,
      docenteNombre: 'Ing. Roberto Silva',
      cuposDisponibles: 5,
      cuposTotales: 20,
      estado: true,
      horario: 'Vie 19:00 - 22:00',
      fechaInicio: '17 de Agosto de 2026 (Ciclo 2026-II)',
      fechaFin: '18 de Diciembre de 2026 (Fin Semestre)'
    }
  ];

  constructor() {
    this.initStorage();
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private getStoredUsers(): Usuario[] {
    if (!this.isBrowser()) return [...this.defaultUsers];
    const data = localStorage.getItem(this.USERS_KEY);
    if (!data) return [...this.defaultUsers];
    try {
      const parsed: Usuario[] = JSON.parse(data);
      // Asegurar que usuarios predefinidos existan siempre (ej. nuevos alumnos creados)
      const existingIds = new Set(parsed.map(u => u.id));
      const missingUsers = this.defaultUsers.filter(u => !existingIds.has(u.id));
      if (missingUsers.length > 0) {
        const merged = [...parsed, ...missingUsers];
        localStorage.setItem(this.USERS_KEY, JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch {
      return [...this.defaultUsers];
    }
  }

  private setStoredUsers(users: Usuario[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  private getStoredCourses(): Curso[] {
    if (!this.isBrowser()) return [...this.defaultCourses];
    const data = localStorage.getItem(this.COURSES_KEY);
    if (!data) return [...this.defaultCourses];
    try {
      const parsed: Curso[] = JSON.parse(data);
      // Garantizar que cursos preexistentes se actualicen al año vigente (2026/2027)
      return parsed.map((c, index) => {
        const fallback = this.defaultCourses[index % this.defaultCourses.length];
        let fInicio = c.fechaInicio || fallback?.fechaInicio || '16 de Marzo de 2026 (Ciclo 2026-I)';
        let fFin = c.fechaFin || fallback?.fechaFin || '17 de Julio de 2026 (Fin Semestre)';

        // Migración automática de 2025 a 2026
        fInicio = fInicio.replace(/2025/g, '2026');
        fFin = fFin.replace(/2025/g, '2026');

        return {
          ...c,
          fechaInicio: fInicio,
          fechaFin: fFin
        };
      });
    } catch {
      return [...this.defaultCourses];
    }
  }

  private setStoredCourses(courses: Curso[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.COURSES_KEY, JSON.stringify(courses));
    }
  }

  private enrichEnrollment(m: Matricula, users: Usuario[], courses: Curso[]): Matricula {
    const user = users.find(u => u.id === m.estudianteId);
    const course = courses.find(c => c.id === m.cursoId);
    
    // Cálculo de promedio y estado académico
    let promedio = m.promedioFinal;
    let estado: 'APROBADO' | 'DESAPROBADO' | 'EN_CURSO' = m.estadoAcademico || 'EN_CURSO';

    if (m.notaEC1 != null && m.notaEC2 != null && m.notaEC3 != null && m.notaEF != null) {
      promedio = Number(((Number(m.notaEC1) * 0.2) + (Number(m.notaEC2) * 0.2) + (Number(m.notaEC3) * 0.2) + (Number(m.notaEF) * 0.4)).toFixed(1));
      estado = promedio >= 12.5 ? 'APROBADO' : 'DESAPROBADO';
    } else {
      const validNotas = [m.notaEC1, m.notaEC2, m.notaEC3, m.notaEF].filter(n => n != null && !isNaN(Number(n))) as number[];
      if (validNotas.length > 0) {
        promedio = Number((validNotas.reduce((a, b) => a + Number(b), 0) / validNotas.length).toFixed(1));
        estado = 'EN_CURSO';
      } else {
        promedio = null;
        estado = 'EN_CURSO';
      }
    }

    return {
      ...m,
      estudianteNombre: user ? user.nombreCompleto : (m.estudianteNombre || 'Estudiante'),
      estudianteCodigo: user ? user.codigoInstitucional : (m.estudianteCodigo || `EST-${m.estudianteId}`),
      estudianteEmail: user ? user.email : '',
      cursoNombre: course ? course.nombre : (m.cursoNombre || 'Asignatura'),
      cursoCodigo: course ? course.codigo : (m.cursoCodigo || 'CUR-000'),
      promedioFinal: promedio,
      estadoAcademico: estado
    };
  }

  private getStoredEnrollments(): Matricula[] {
    const users = this.getStoredUsers();
    const courses = this.getStoredCourses();

    if (!this.isBrowser()) {
      return this.defaultEnrollments.map(m => this.enrichEnrollment(m, users, courses));
    }

    const data = localStorage.getItem(this.ENROLLMENTS_KEY);
    if (!data) {
      const enriched = this.defaultEnrollments.map(m => this.enrichEnrollment(m, users, courses));
      localStorage.setItem(this.ENROLLMENTS_KEY, JSON.stringify(enriched));
      return enriched;
    }

    try {
      const parsed: Matricula[] = JSON.parse(data);
      // Asegurar que si el storage previo tenía pocas matrículas, se sincronicen las por defecto
      const existingKeySet = new Set(parsed.map(p => `${p.estudianteId}-${p.cursoId}`));
      const missingEnrollments = this.defaultEnrollments.filter(d => !existingKeySet.has(`${d.estudianteId}-${d.cursoId}`));
      
      const allEnrollments = missingEnrollments.length > 0 ? [...parsed, ...missingEnrollments] : parsed;
      const enriched = allEnrollments.map(m => this.enrichEnrollment(m, users, courses));
      return enriched;
    } catch {
      return this.defaultEnrollments.map(m => this.enrichEnrollment(m, users, courses));
    }
  }

  private setStoredEnrollments(enrollments: Matricula[]): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.ENROLLMENTS_KEY, JSON.stringify(enrollments));
    }
  }

  private initStorage(): void {
    if (this.isBrowser()) {
      if (!localStorage.getItem(this.USERS_KEY)) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(this.defaultUsers));
      }
      if (!localStorage.getItem(this.COURSES_KEY)) {
        localStorage.setItem(this.COURSES_KEY, JSON.stringify(this.defaultCourses));
      }
      if (!localStorage.getItem(this.ENROLLMENTS_KEY)) {
        localStorage.setItem(this.ENROLLMENTS_KEY, JSON.stringify(this.defaultEnrollments));
      }
    }
  }

  // --- AUTENTICACIÓN & GENERACIÓN DE JWT SIMULADO ---
  public login(req: LoginRequest): Observable<AuthResponse> {
    const users: Usuario[] = this.getStoredUsers();
    const user = users.find(u => u.email.toLowerCase() === req.email.toLowerCase());

    // Validar credenciales predefinidas o por defecto
    const isMockValid =
      (req.email === 'admin@idat.edu.pe' && req.clave === 'admin123') ||
      (req.email === 'profesor@idat.edu.pe' && req.clave === 'prof123') ||
      (req.email === 'estudiante@idat.edu.pe' && req.clave === 'est123') ||
      (user && req.clave.length >= 4);

    if (!user || !isMockValid) {
      return throwError(() => ({
        status: 401,
        statusText: 'Unauthorized',
        error: { message: 'Credenciales inválidas. Verifique su correo o contraseña.' }
      })).pipe(delay(400));
    }

    if (!user.estado) {
      return throwError(() => ({
        status: 403,
        statusText: 'Forbidden',
        error: { message: 'El usuario se encuentra inactivo. Contacte al administrador.' }
      })).pipe(delay(400));
    }

    const token = this.generateSimulatedJwt(user);
    const expiraEn = 3600; // 1 hora en segundos

    const response: AuthResponse = {
      token,
      expiraEn,
      usuario: {
        id: user.id,
        nombre: user.nombreCompleto,
        email: user.email,
        rol: user.rol,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`
      }
    };

    return of(response).pipe(delay(300));
  }

  private generateSimulatedJwt(user: Usuario): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(JSON.stringify({
      sub: user.email,
      id: user.id,
      nombre: user.nombreCompleto,
      rol: user.rol,
      codigo: user.codigoInstitucional,
      iat: now,
      exp: now + 3600
    }));
    const signature = btoa(`idat-secret-signature-sha256-verified-key`);
    return `${header}.${payload}.${signature}`;
  }

  // --- CRUD USUARIOS ---
  public getUsuarios(): Observable<Usuario[]> {
    const users = this.getStoredUsers();
    return of(users).pipe(delay(200));
  }

  public getUsuarioById(id: number): Observable<Usuario> {
    const users: Usuario[] = this.getStoredUsers();
    const user = users.find(u => u.id === id);
    if (!user) {
      return throwError(() => ({ status: 404, error: { message: 'Usuario no encontrado' } }));
    }
    return of(user).pipe(delay(150));
  }

  public createUsuario(dto: UsuarioCreateDto): Observable<Usuario> {
    const users: Usuario[] = this.getStoredUsers();
    
    // Validar correo duplicado
    if (users.some(u => u.email.toLowerCase() === dto.email.toLowerCase())) {
      return throwError(() => ({ status: 400, error: { message: 'El correo electrónico ya está registrado.' } }));
    }

    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const nuevoUsuario: Usuario = {
      id: newId,
      nombreCompleto: dto.nombreCompleto,
      email: dto.email,
      rol: dto.rol,
      codigoInstitucional: dto.codigoInstitucional || `USR-${newId.toString().padStart(4, '0')}`,
      estado: dto.estado ?? true,
      telefono: dto.telefono || '+51 900 000 000',
      fechaCreacion: new Date().toISOString().split('T')[0]
    };

    users.push(nuevoUsuario);
    this.setStoredUsers(users);
    return of(nuevoUsuario).pipe(delay(300));
  }

  public updateUsuario(dto: UsuarioUpdateDto): Observable<Usuario> {
    let users: Usuario[] = this.getStoredUsers();
    const index = users.findIndex(u => u.id === dto.id);

    if (index === -1) {
      return throwError(() => ({ status: 404, error: { message: 'Usuario no encontrado para actualizar.' } }));
    }

    users[index] = {
      ...users[index],
      nombreCompleto: dto.nombreCompleto,
      email: dto.email,
      rol: dto.rol,
      codigoInstitucional: dto.codigoInstitucional,
      estado: dto.estado,
      telefono: dto.telefono
    };

    this.setStoredUsers(users);
    return of(users[index]).pipe(delay(250));
  }

  public deleteUsuario(id: number): Observable<boolean> {
    let users: Usuario[] = this.getStoredUsers();
    const initialLen = users.length;
    users = users.filter(u => u.id !== id);

    if (users.length === initialLen) {
      return throwError(() => ({ status: 404, error: { message: 'Usuario no encontrado para eliminar.' } }));
    }

    this.setStoredUsers(users);
    return of(true).pipe(delay(250));
  }

  // --- CRUD CURSOS ---
  public getCursos(): Observable<Curso[]> {
    const courses = this.getStoredCourses();
    return of(courses).pipe(delay(200));
  }

  public getCursoById(id: number): Observable<Curso> {
    const courses: Curso[] = this.getStoredCourses();
    const course = courses.find(c => c.id === id);
    if (!course) {
      return throwError(() => ({ status: 404, error: { message: 'Curso no encontrado' } }));
    }
    return of(course).pipe(delay(150));
  }

  public createCurso(dto: CursoCreateDto): Observable<Curso> {
    const courses: Curso[] = this.getStoredCourses();
    const users: Usuario[] = this.getStoredUsers();
    const docente = users.find(u => u.id === Number(dto.docenteId));

    const newId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    const nuevoCurso: Curso = {
      id: newId,
      codigo: dto.codigo.toUpperCase(),
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      categoria: dto.categoria,
      creditos: Number(dto.creditos),
      docenteId: Number(dto.docenteId),
      docenteNombre: docente ? docente.nombreCompleto : 'Docente Asignado',
      cuposDisponibles: Number(dto.cuposTotales),
      cuposTotales: Number(dto.cuposTotales),
      estado: dto.estado ?? true,
      horario: dto.horario,
      fechaInicio: dto.fechaInicio || '16 de Marzo de 2026 (Ciclo 2026-I)',
      fechaFin: dto.fechaFin || '17 de Julio de 2026 (Fin Semestre)'
    };

    courses.push(nuevoCurso);
    this.setStoredCourses(courses);
    return of(nuevoCurso).pipe(delay(300));
  }

  public updateCurso(dto: CursoUpdateDto): Observable<Curso> {
    let courses: Curso[] = this.getStoredCourses();
    const users: Usuario[] = this.getStoredUsers();
    const index = courses.findIndex(c => c.id === dto.id);

    if (index === -1) {
      return throwError(() => ({ status: 404, error: { message: 'Curso no encontrado para actualizar.' } }));
    }

    const docente = users.find(u => u.id === Number(dto.docenteId));

    courses[index] = {
      ...courses[index],
      codigo: dto.codigo.toUpperCase(),
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      categoria: dto.categoria,
      creditos: Number(dto.creditos),
      docenteId: Number(dto.docenteId),
      docenteNombre: docente ? docente.nombreCompleto : courses[index].docenteNombre,
      cuposTotales: Number(dto.cuposTotales),
      estado: dto.estado,
      horario: dto.horario,
      fechaInicio: dto.fechaInicio || courses[index].fechaInicio,
      fechaFin: dto.fechaFin || courses[index].fechaFin
    };

    this.setStoredCourses(courses);
    return of(courses[index]).pipe(delay(250));
  }

  public deleteCurso(id: number): Observable<boolean> {
    let courses: Curso[] = this.getStoredCourses();
    const initialLen = courses.length;
    courses = courses.filter(c => c.id !== id);

    if (courses.length === initialLen) {
      return throwError(() => ({ status: 404, error: { message: 'Curso no encontrado para eliminar.' } }));
    }

    this.setStoredCourses(courses);
    return of(true).pipe(delay(250));
  }

  // --- GESTIÓN DE MATRÍCULAS ---
  public getMatriculas(estudianteId?: number): Observable<Matricula[]> {
    const enrollments = this.getStoredEnrollments();
    if (estudianteId) {
      return of(enrollments.filter(e => e.estudianteId === estudianteId)).pipe(delay(150));
    }
    return of(enrollments).pipe(delay(150));
  }

  public getCursosMatriculados(estudianteId: number): Observable<Curso[]> {
    const enrollments = this.getStoredEnrollments().filter(e => e.estudianteId === estudianteId);
    const courses = this.getStoredCourses();
    const enrolledCourseIds = new Set(enrollments.map(e => e.cursoId));
    const enrolledCourses = courses.filter(c => enrolledCourseIds.has(c.id));
    return of(enrolledCourses).pipe(delay(200));
  }

  public matricularEstudiante(estudianteId: number, cursoId: number): Observable<Matricula> {
    const enrollments = this.getStoredEnrollments();
    const courses = this.getStoredCourses();
    const courseIndex = courses.findIndex(c => c.id === cursoId);

    if (courseIndex === -1) {
      return throwError(() => ({ status: 404, error: { message: 'El curso seleccionado no existe.' } }));
    }

    const course = courses[courseIndex];

    if (!course.estado) {
      return throwError(() => ({ status: 400, error: { message: 'No es posible matricularse en un curso inactivo.' } }));
    }

    if (enrollments.some(e => e.estudianteId === estudianteId && e.cursoId === cursoId)) {
      return throwError(() => ({ status: 400, error: { message: 'Ya te encuentras matriculado en este curso.' } }));
    }

    if (course.cuposDisponibles <= 0) {
      return throwError(() => ({ status: 400, error: { message: 'No hay cupos disponibles para este curso.' } }));
    }

    // Reducir cupo disponible
    courses[courseIndex] = {
      ...course,
      cuposDisponibles: course.cuposDisponibles - 1
    };
    this.setStoredCourses(courses);

    const newId = enrollments.length > 0 ? Math.max(...enrollments.map(e => e.id)) + 1 : 1;
    const nuevaMatricula: Matricula = {
      id: newId,
      estudianteId,
      cursoId,
      fechaMatricula: new Date().toISOString().split('T')[0]
    };

    enrollments.push(nuevaMatricula);
    this.setStoredEnrollments(enrollments);

    return of(nuevaMatricula).pipe(delay(250));
  }

  public desmatricularEstudiante(estudianteId: number, cursoId: number): Observable<boolean> {
    let enrollments = this.getStoredEnrollments();
    const initialLen = enrollments.length;
    enrollments = enrollments.filter(e => !(e.estudianteId === estudianteId && e.cursoId === cursoId));

    if (enrollments.length === initialLen) {
      return throwError(() => ({ status: 404, error: { message: 'No se encontró la matrícula activa para este curso.' } }));
    }

    // Restaurar cupo disponible si es menor a cupos totales
    const courses = this.getStoredCourses();
    const courseIndex = courses.findIndex(c => c.id === cursoId);
    if (courseIndex !== -1) {
      courses[courseIndex] = {
        ...courses[courseIndex],
        cuposDisponibles: Math.min(courses[courseIndex].cuposTotales, courses[courseIndex].cuposDisponibles + 1)
      };
      this.setStoredCourses(courses);
    }

    this.setStoredEnrollments(enrollments);
    return of(true).pipe(delay(200));
  }

  // --- GESTIÓN Y ASIGNACIÓN DE NOTAS (DOCENTES & ALUMNOS) ---
  public getMatriculasPorCurso(cursoId: number): Observable<Matricula[]> {
    const enrollments = this.getStoredEnrollments();
    const cursoEnrollments = enrollments.filter(e => e.cursoId === cursoId);
    return of(cursoEnrollments).pipe(delay(200));
  }

  public guardarNotasCurso(cursoId: number, notasList: ActualizarNotaItemDto[]): Observable<Matricula[]> {
    let enrollments = this.getStoredEnrollments();
    const users = this.getStoredUsers();
    const courses = this.getStoredCourses();

    notasList.forEach(dto => {
      const idx = enrollments.findIndex(e => e.id === dto.matriculaId);
      if (idx !== -1) {
        enrollments[idx] = {
          ...enrollments[idx],
          notaEC1: dto.notaEC1 !== undefined ? dto.notaEC1 : enrollments[idx].notaEC1,
          notaEC2: dto.notaEC2 !== undefined ? dto.notaEC2 : enrollments[idx].notaEC2,
          notaEC3: dto.notaEC3 !== undefined ? dto.notaEC3 : enrollments[idx].notaEC3,
          notaEF: dto.notaEF !== undefined ? dto.notaEF : enrollments[idx].notaEF,
          observaciones: dto.observaciones !== undefined ? dto.observaciones : enrollments[idx].observaciones
        };
        enrollments[idx] = this.enrichEnrollment(enrollments[idx], users, courses);
      }
    });

    this.setStoredEnrollments(enrollments);
    const updatedCursoEnrollments = enrollments.filter(e => e.cursoId === cursoId);
    return of(updatedCursoEnrollments).pipe(delay(300));
  }

  public actualizarNotas(matriculaId: number, dto: ActualizarNotaItemDto): Observable<Matricula> {
    let enrollments = this.getStoredEnrollments();
    const users = this.getStoredUsers();
    const courses = this.getStoredCourses();
    const idx = enrollments.findIndex(e => e.id === matriculaId);

    if (idx === -1) {
      return throwError(() => ({ status: 404, error: { message: 'Matrícula no encontrada para asignar notas.' } }));
    }

    enrollments[idx] = {
      ...enrollments[idx],
      notaEC1: dto.notaEC1 !== undefined ? dto.notaEC1 : enrollments[idx].notaEC1,
      notaEC2: dto.notaEC2 !== undefined ? dto.notaEC2 : enrollments[idx].notaEC2,
      notaEC3: dto.notaEC3 !== undefined ? dto.notaEC3 : enrollments[idx].notaEC3,
      notaEF: dto.notaEF !== undefined ? dto.notaEF : enrollments[idx].notaEF,
      observaciones: dto.observaciones !== undefined ? dto.observaciones : enrollments[idx].observaciones
    };

    enrollments[idx] = this.enrichEnrollment(enrollments[idx], users, courses);
    this.setStoredEnrollments(enrollments);

    return of(enrollments[idx]).pipe(delay(250));
  }
}

