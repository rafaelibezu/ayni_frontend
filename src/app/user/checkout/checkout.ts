import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Address, CreateAddressRequest } from '../../core/models/address.model';
import { Cart } from '../../core/models/cart.model';
import { AddressService } from '../../core/services/address.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  private readonly addressService = inject(AddressService);
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);

  readonly shippingCost = 5;

  cart = signal<Cart | null>(null);
  addresses = signal<Address[]>([]);
  selectedAddressId = signal<number | null>(null);
  isLoading = signal(true);
  isCreatingAddress = signal(false);
  isCheckingOut = signal(false);
  showAddressForm = signal(false);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  observations = 'Pedido realizado desde la web';
  addressForm: CreateAddressRequest = {
    alias: 'Casa',
    destinatario: '',
    celular: '',
    documentoTipo: 'DNI',
    documentoNumero: '',
    direccion: '',
    distrito: '',
    referencia: '',
    principal: true,
  };

  constructor() {
    this.loadCheckout();
  }

  loadCheckout(): void {
    this.isLoading.set(true);
    let pending = 2;
    const finish = () => {
      pending -= 1;
      if (pending === 0) this.isLoading.set(false);
    };

    this.cartService
      .findMyCart()
      .pipe(finalize(finish))
      .subscribe({
      next: (cart) => this.cart.set(cart),
      error: (error) => this.showError(error, 'No se pudo cargar tu carrito.'),
    });

    this.addressService
      .findAll()
      .pipe(finalize(finish))
      .subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
        const selected = addresses.find((address) => address.esPrincipal) || addresses[0];
        this.selectedAddressId.set(selected?.id || null);
        this.showAddressForm.set(addresses.length === 0);
      },
      error: (error) => this.showError(error, 'No se pudieron cargar tus direcciones.'),
    });
  }

  selectAddress(addressId: number): void {
    this.selectedAddressId.set(addressId);
    this.feedback.set(null);
  }

  createAddress(): void {
    if (!this.addressForm.destinatario || !this.addressForm.celular || !this.addressForm.direccion || !this.addressForm.distrito) {
      this.feedback.set({ type: 'error', text: 'Completa destinatario, celular, direccion y distrito.' });
      return;
    }

    this.isCreatingAddress.set(true);
    this.feedback.set(null);
    this.addressService
      .create(this.addressForm)
      .pipe(finalize(() => this.isCreatingAddress.set(false)))
      .subscribe({
        next: (address) => {
          this.addresses.update((addresses) => [address, ...addresses]);
          this.selectedAddressId.set(address.id);
          this.showAddressForm.set(false);
          this.feedback.set({ type: 'success', text: 'Direccion agregada correctamente.' });
        },
        error: (error) => this.showError(error, 'No se pudo crear la direccion.'),
      });
  }

  continueWithYape(): void {
    const addressId = this.selectedAddressId();

    if (!addressId) {
      this.feedback.set({ type: 'error', text: 'Selecciona o agrega una direccion de entrega.' });
      return;
    }

    if (!this.cart()?.items.length) {
      this.feedback.set({ type: 'error', text: 'Tu carrito esta vacio.' });
      return;
    }

    this.isCheckingOut.set(true);
    this.feedback.set(null);
    this.orderService
      .checkout({ addressId, observaciones: this.observations || 'Pedido realizado desde la web' })
      .pipe(finalize(() => this.isCheckingOut.set(false)))
      .subscribe({
        next: (order) => this.router.navigate(['/user/checkout/yape', order.id]),
        error: (error) => this.showError(error, 'No se pudo confirmar el pedido.'),
      });
  }

  get total(): number {
    return (this.cart()?.subtotal || 0) + this.shippingCost;
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
  }

  private showError(error: unknown, fallback: string): void {
    const httpError = error as HttpErrorResponse;
    this.feedback.set({ type: 'error', text: httpError?.error?.message || fallback });
  }
}
