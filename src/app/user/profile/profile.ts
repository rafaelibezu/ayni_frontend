import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  AddressRequest,
  UpdateUserProfileRequest,
  UserAddress,
  UserProfile,
} from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

type ProfileTab = 'profile' | 'addresses';
const EMPTY_ADDRESS: AddressRequest = {
  destinatario: '',
  celular: '',
  documentoTipo: '',
  documentoNumero: '',
  direccion: '',
  distrito: '',
  referencia: '',
  esPrincipal: false,
};

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  user = signal<UserProfile | null>(this.authService.currentUser() as UserProfile | null);
  addresses = signal<UserAddress[]>([]);
  activeTab = signal<ProfileTab>('profile');
  isLoading = signal(true);
  isSavingProfile = signal(false);
  isSavingPassword = signal(false);
  isSavingAddress = signal(false);
  editingAddressId = signal<number | null>(null);
  showAddressForm = signal(false);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  profileForm: UpdateUserProfileRequest = {
    nombres: '',
    apellidos: '',
    celular: '',
    documentoTipo: '',
    documentoNumero: '',
  };
  passwordForm = { passwordActual: '', nuevaPassword: '', confirmarPassword: '' };
  addressForm: AddressRequest = { ...EMPTY_ADDRESS };

  constructor() {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.userService
      .getMe()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (user) => this.applyUser(user),
        error: (error) => this.showError(error, 'No se pudo cargar tu información.'),
      });
  }

  selectTab(tab: ProfileTab): void {
    this.activeTab.set(tab);
    this.feedback.set(null);
    if (tab === 'addresses') this.loadAddresses();
  }

  saveProfile(form: NgForm): void {
    if (form.invalid || this.isSavingProfile()) {
      form.control.markAllAsTouched();
      return;
    }
    this.isSavingProfile.set(true);
    this.feedback.set(null);
    this.userService
      .updateMe(this.profileForm)
      .pipe(finalize(() => this.isSavingProfile.set(false)))
      .subscribe({
        next: (user) => {
          this.applyUser(user);
          this.showSuccess('Tus datos se guardaron correctamente.');
        },
        error: (error) => this.showError(error, 'No se pudieron guardar los cambios.'),
      });
  }

  updatePassword(form: NgForm): void {
    if (form.invalid || this.isSavingPassword()) {
      form.control.markAllAsTouched();
      return;
    }
    if (this.passwordForm.nuevaPassword !== this.passwordForm.confirmarPassword) {
      this.feedback.set({ type: 'error', text: 'La confirmación de contraseña no coincide.' });
      return;
    }
    this.isSavingPassword.set(true);
    this.feedback.set(null);
    this.userService
      .changePassword({
        passwordActual: this.passwordForm.passwordActual,
        nuevaPassword: this.passwordForm.nuevaPassword,
        confirmarPassword: this.passwordForm.confirmarPassword,
      })
      .pipe(finalize(() => this.isSavingPassword.set(false)))
      .subscribe({
        next: () => {
          form.resetForm();
          this.showSuccess('Tu contraseña fue actualizada.');
        },
        error: (error) => this.showError(error, 'No se pudo actualizar la contraseña.'),
      });
  }

  loadAddresses(): void {
    this.userService.getAddresses().subscribe({
      next: (addresses) => this.addresses.set(addresses),
      error: (error) => this.showError(error, 'No se pudieron cargar tus direcciones.'),
    });
  }

  startNewAddress(): void {
    this.editingAddressId.set(null);
    this.addressForm = { ...EMPTY_ADDRESS };
    this.showAddressForm.set(true);
  }
  editAddress(address: UserAddress): void {
    this.editingAddressId.set(address.id);
    this.addressForm = {
      destinatario: address.destinatario,
      celular: address.celular,
      documentoTipo: address.documentoTipo || '',
      documentoNumero: address.documentoNumero || '',
      direccion: address.direccion,
      distrito: address.distrito,
      referencia: address.referencia || '',
      esPrincipal: address.esPrincipal,
    };
    this.showAddressForm.set(true);
  }
  cancelAddress(): void {
    this.showAddressForm.set(false);
    this.editingAddressId.set(null);
    this.addressForm = { ...EMPTY_ADDRESS };
  }

  saveAddress(form: NgForm): void {
    if (form.invalid || this.isSavingAddress()) {
      form.control.markAllAsTouched();
      return;
    }
    this.isSavingAddress.set(true);
    const addressId = this.editingAddressId();
    const request = addressId
      ? this.userService.updateAddress(addressId, this.addressForm)
      : this.userService.createAddress(this.addressForm);
    request.pipe(finalize(() => this.isSavingAddress.set(false))).subscribe({
      next: () => {
        this.cancelAddress();
        this.loadAddresses();
        this.showSuccess(addressId ? 'Dirección actualizada.' : 'Dirección agregada.');
      },
      error: (error) => this.showError(error, 'No se pudo guardar la dirección.'),
    });
  }

  setMain(addressId: number): void {
    this.userService.setMainAddress(addressId).subscribe({
      next: () => {
        this.loadAddresses();
        this.showSuccess('Dirección principal actualizada.');
      },
      error: (error) => this.showError(error, 'No se pudo cambiar la dirección principal.'),
    });
  }
  deleteAddress(address: UserAddress): void {
    if (!window.confirm(`¿Eliminar la dirección de ${address.destinatario}?`)) return;
    this.userService.deleteAddress(address.id).subscribe({
      next: () => {
        this.addresses.update((items) => items.filter((item) => item.id !== address.id));
        this.showSuccess('Dirección eliminada.');
      },
      error: (error) => this.showError(error, 'No se pudo eliminar la dirección.'),
    });
  }

  private applyUser(user: UserProfile): void {
    this.user.set(user);
    this.profileForm = {
      nombres: user.nombres || '',
      apellidos: user.apellidos || '',
      celular: user.celular || '',
      documentoTipo: user.documentoTipo || '',
      documentoNumero: user.documentoNumero || '',
    };
  }
  private showSuccess(text: string): void {
    this.feedback.set({ type: 'success', text });
  }
  private showError(error: unknown, fallback: string): void {
    const httpError = error as HttpErrorResponse;
    this.feedback.set({ type: 'error', text: httpError?.error?.message || fallback });
  }
}
