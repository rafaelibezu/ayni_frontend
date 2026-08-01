import { AfterViewInit, Component, NgZone, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest, RegisterRequest } from '../../core/models/auth.model';

declare const google: any;

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth implements AfterViewInit {
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly ngZone = inject(NgZone);

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

  ngAfterViewInit(): void {
    this.loadGoogleButton();
  }

  private loadGoogleButton(): void {
    if (!environment.googleClientId || environment.googleClientId === 'TU_GOOGLE_CLIENT_ID') {
      this.errorMessage.set('Falta configurar el Google Client ID en environment.');
      return;
    }

    const interval = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts?.id) {
        clearInterval(interval);

        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => {
            this.ngZone.run(() => {
              console.log('Google response:', response);

              if (!response?.credential) {
                this.errorMessage.set('Google no devolvió credencial.');
                return;
              }

              this.handleGoogleCredential(response.credential);
            });
          },
        });

        const buttonContainer = document.getElementById('google-button');

        if (buttonContainer) {
          google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: 'continue_with',
            width: 320,
          });
        }
      }
    }, 300);
  }

  private handleGoogleCredential(idToken: string): void {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.authService.redirectByRole();
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Google backend error:', error);
        this.errorMessage.set(error?.error?.message || 'No se pudo iniciar sesión con Google.');
      },
    });
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
}