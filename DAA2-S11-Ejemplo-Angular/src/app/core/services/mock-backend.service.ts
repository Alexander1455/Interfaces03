import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthResponse, LoginRequest, UserRole } from '../models/auth.model';
import { Usuario, UsuarioCreateDto, UsuarioUpdateDto } from '../models/usuario.model';
import { Curso, CursoCreateDto, CursoUpdateDto, Matricula } from '../models/curso.model';

@Injectable({
  providedIn: 'root'
})
export class MockBackendService {
  private readonly USERS_KEY = 'idat_academic_users';
  private readonly COURSES_KEY = 'idat_academic_courses';
  private readonly ENROLLMENTS_KEY = 'idat_academic_enrollments';

  private defaultEnrollments: Matricula[] = [
    { id: 1, estudianteId: 3, cursoId: 1, fechaMatricula: '2025-03-05' },
    { id: 2, estudianteId: 3, cursoId: 3, fechaMatricula: '2025-03-06' },
    { id: 3, estudianteId: 5, cursoId: 1, fechaMatricula: '2025-03-10' },
    { id: 4, estudianteId: 5, cursoId: 2, fechaMatricula: '2025-03-11' }
  ];

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
      horario: 'Lun - Mie 19:00 - 21:30',
      fechaInicio: '17 de Marzo de 2025 (Ciclo 2025-I)',
      fechaFin: '18 de Julio de 2025 (Fin Semestre)'
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
      fechaInicio: '01 de Abril de 2025 (Ciclo 2025-I)',
      fechaFin: '01 de Agosto de 2025 (Fin Semestre)'
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
      fechaInicio: '05 de Mayo de 2025 (Ciclo Modular)',
      fechaFin: '19 de Diciembre de 2025 (Fin Semestre)'
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
      fechaInicio: '18 de Agosto de 2025 (Ciclo 2025-II)',
      fechaFin: '19 de Diciembre de 2025 (Fin Semestre)'
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
    return data ? JSON.parse(data) : [...this.defaultUsers];
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
      // Garantizar que cursos preexistentes tengan fechaInicio y fechaFin
      return parsed.map((c, index) => {
        const fallback = this.defaultCourses[index % this.defaultCourses.length];
        return {
          ...c,
          fechaInicio: c.fechaInicio || fallback?.fechaInicio || '17 de Marzo de 2025 (Ciclo 2025-I)',
          fechaFin: c.fechaFin || fallback?.fechaFin || '18 de Julio de 2025 (Fin Semestre)'
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

  private getStoredEnrollments(): Matricula[] {
    if (!this.isBrowser()) return [...this.defaultEnrollments];
    const data = localStorage.getItem(this.ENROLLMENTS_KEY);
    return data ? JSON.parse(data) : [...this.defaultEnrollments];
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
      fechaInicio: dto.fechaInicio || '17 de Marzo de 2025 (Ciclo 2025-I)',
      fechaFin: dto.fechaFin || '18 de Julio de 2025 (Fin Semestre)'
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
}

