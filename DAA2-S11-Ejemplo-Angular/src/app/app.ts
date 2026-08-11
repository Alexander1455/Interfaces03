import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: false
})
export class App {
  constructor(
    public authService: AuthService,
    public router: Router
  ) {}

  get showLayout(): boolean {
    return this.authService.isLoggedIn() && this.router.url !== '/login';
  }
}
