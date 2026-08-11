import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthResponse, LoginRequest, UserRole } from '../models/auth.model';
import { Usuario, UsuarioCreateDto, UsuarioUpdateDto } from '../models/usuario.model';
import { Curso, CursoCreateDto, CursoUpdateDto } from '../models/curso.model';

@Injectable({
  providedIn: 'root'
})
export class MockBackendService {
  private readonly USERS_KEY = 'idat_academic_users';
  private readonly COURSES_KEY = 'idat_academic_courses';

  private defaultUsers: Usuario[] = [
    {
      id: 1,
      nombreCompleto: 'Alexander García (Administrador)',
      email: 'admin@idat.edu.pe',
      rol: 'ADMIN',
      codigoInstitucional: 'ADM-2025-01',
      estado: true,
      telefono: '+51 987 654 321',
      fechaCreacion: '2025-01-15'
    },
    {
      id: 2,
      nombreCompleto: 'Dra. María Rodríguez (Docente)',
      email: 'profesor@idat.edu.pe',
      rol: 'PROFESOR',
      codigoInstitucional: 'DOC-1004-92',
      estado: true,
      telefono: '+51 912 345 678',
      fechaCreacion: '2025-02-10'
    },
    {
      id: 3,
      nombreCompleto: 'Carlos Mendoza (Estudiante)',
      email: 'estudiante@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-8841-20',
      estado: true,
      telefono: '+51 998 712 334',
      fechaCreacion: '2025-03-01'
    },
    {
      id: 4,
      nombreCompleto: 'Ing. Roberto Silva (Docente)',
      email: 'rsilva@idat.edu.pe',
      rol: 'PROFESOR',
      codigoInstitucional: 'DOC-1005-14',
      estado: true,
      telefono: '+51 933 221 445',
      fechaCreacion: '2025-02-20'
    },
    {
      id: 5,
      nombreCompleto: 'Lucía Fernández (Estudiante)',
      email: 'lfernandez@idat.edu.pe',
      rol: 'ESTUDIANTE',
      codigoInstitucional: 'EST-9122-31',
      estado: true,
      telefono: '+51 944 556 677',
      fechaCreacion: '2025-03-12'
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
      horario: 'Lun - Mie 19:00 - 21:30'
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
      horario: 'Mar - Jue 18:30 - 21:00'
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
      horario: 'Sab 08:00 - 13:00'
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
      horario: 'Vie 19:00 - 22:00'
    }
  ];

  constructor() {
    this.initStorage();
  }

  private initStorage(): void {
    if (!localStorage.getItem(this.USERS_KEY)) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(this.defaultUsers));
    }
    if (!localStorage.getItem(this.COURSES_KEY)) {
      localStorage.setItem(this.COURSES_KEY, JSON.stringify(this.defaultCourses));
    }
  }

  // --- AUTENTICACIÓN & GENERACIÓN DE JWT SIMULADO ---
  public login(req: LoginRequest): Observable<AuthResponse> {
    const users: Usuario[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
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
    const users = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    return of(users).pipe(delay(200));
  }

  public getUsuarioById(id: number): Observable<Usuario> {
    const users: Usuario[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const user = users.find(u => u.id === id);
    if (!user) {
      return throwError(() => ({ status: 404, error: { message: 'Usuario no encontrado' } }));
    }
    return of(user).pipe(delay(150));
  }

  public createUsuario(dto: UsuarioCreateDto): Observable<Usuario> {
    const users: Usuario[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    
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
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return of(nuevoUsuario).pipe(delay(300));
  }

  public updateUsuario(dto: UsuarioUpdateDto): Observable<Usuario> {
    let users: Usuario[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
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

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return of(users[index]).pipe(delay(250));
  }

  public deleteUsuario(id: number): Observable<boolean> {
    let users: Usuario[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    const initialLen = users.length;
    users = users.filter(u => u.id !== id);

    if (users.length === initialLen) {
      return throwError(() => ({ status: 404, error: { message: 'Usuario no encontrado para eliminar.' } }));
    }

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return of(true).pipe(delay(250));
  }

  // --- CRUD CURSOS ---
  public getCursos(): Observable<Curso[]> {
    const courses = JSON.parse(localStorage.getItem(this.COURSES_KEY) || '[]');
    return of(courses).pipe(delay(200));
  }

  public getCursoById(id: number): Observable<Curso> {
    const courses: Curso[] = JSON.parse(localStorage.getItem(this.COURSES_KEY) || '[]');
    const course = courses.find(c => c.id === id);
    if (!course) {
      return throwError(() => ({ status: 404, error: { message: 'Curso no encontrado' } }));
    }
    return of(course).pipe(delay(150));
  }

  public createCurso(dto: CursoCreateDto): Observable<Curso> {
    const courses: Curso[] = JSON.parse(localStorage.getItem(this.COURSES_KEY) || '[]');
    const users: Usuario[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
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
      horario: dto.horario
    };

    courses.push(nuevoCurso);
    localStorage.setItem(this.COURSES_KEY, JSON.stringify(courses));
    return of(nuevoCurso).pipe(delay(300));
  }

  public updateCurso(dto: CursoUpdateDto): Observable<Curso> {
    let courses: Curso[] = JSON.parse(localStorage.getItem(this.COURSES_KEY) || '[]');
    const users: Usuario[] = JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
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
      horario: dto.horario
    };

    localStorage.setItem(this.COURSES_KEY, JSON.stringify(courses));
    return of(courses[index]).pipe(delay(250));
  }

  public deleteCurso(id: number): Observable<boolean> {
    let courses: Curso[] = JSON.parse(localStorage.getItem(this.COURSES_KEY) || '[]');
    const initialLen = courses.length;
    courses = courses.filter(c => c.id !== id);

    if (courses.length === initialLen) {
      return throwError(() => ({ status: 404, error: { message: 'Curso no encontrado para eliminar.' } }));
    }

    localStorage.setItem(this.COURSES_KEY, JSON.stringify(courses));
    return of(true).pipe(delay(250));
  }
}
