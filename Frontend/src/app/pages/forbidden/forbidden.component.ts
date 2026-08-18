import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forbidden',
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.css'],
  standalone: false
})
export class ForbiddenComponent {
  constructor(public authService: AuthService) {}
}
