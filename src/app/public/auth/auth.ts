import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { LoginRequest, RegisterRequest } from '../../core/models/auth.model';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  mode = signal<'login' | 'register'>(
    this.route.snapshot.data['mode'] === 'register' ? 'register' : 'login'
  );

  loginForm: LoginRequest = {
    email: '',
    password: '',
  };

  registerForm: RegisterRequest = {
    nombres: '',
    apellidos: '',
    email: '',
    password: '',
    celular: '',
  };

  get isLogin(): boolean {
    return this.mode() === 'login';
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.isLogin) {
      this.login();
      return;
    }

    this.register();
  }

  login(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage.set('Ingresa tu correo y contraseña.');
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginForm).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.authService.redirectByRole();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.error?.message || 'No se pudo iniciar sesión.');
      },
    });
  }

  register(): void {
    if (
      !this.registerForm.nombres ||
      !this.registerForm.apellidos ||
      !this.registerForm.email ||
      !this.registerForm.password
    ) {
      this.errorMessage.set('Completa los datos obligatorios.');
      return;
    }

    this.isLoading.set(true);

    this.authService.register(this.registerForm).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.authService.redirectByRole();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.error?.message || 'No se pudo crear la cuenta.');
      },
    });
  }

  continueWithGoogle(): void {
    this.errorMessage.set(
      'Google Login se conectará en el siguiente paso con Google Identity Services.'
    );
  }
}