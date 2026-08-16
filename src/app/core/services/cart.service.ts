import { inject, Injectable, signal, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { AddCartItemRequest, CartItemResponse, CartResponse, UpdateCartItemRequest } from '../models/cart.model';
import { ApiResponse } from '../models/api-response.model';
import { concatMap, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly localCartKey = 'ayni_guest_cart';

  // Aquí vivirá el estado global de tu carrito (reactivo)
  cart = signal<CartResponse | null>(null);

  constructor() {
    // MAGIA DE ANGULAR: Este 'effect' escucha si el usuario cambia (ej. cuando hace login o logout)
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.syncGuestCartToBackend();
      } else {
        this.loadLocalCart();
      }
    });
  }

  // ==========================================
  // LÓGICA PRINCIPAL: OBTENER, AGREGAR, QUITAR, ACTUALIZAR
  // ==========================================

  loadCart(): void {
    if (this.authService.isAuthenticated()) {
      this.http.get<ApiResponse<CartResponse>>(`${environment.apiUrl}/cart`).subscribe({
        next: (res) => this.cart.set(res.data),
        error: (err) => console.error('Error cargando carrito', err)
      });
    } else {
      this.loadLocalCart();
    }
  }

  addItem(request: AddCartItemRequest, productDetails?: any): void {
    if (this.authService.isAuthenticated()) {
      this.http.post<ApiResponse<CartResponse>>(`${environment.apiUrl}/cart/items`, request).subscribe({
        next: (res) => this.cart.set(res.data)
      });
    } else {
      this.addLocalItem(request, productDetails);
    }
  }

  updateItemQuantity(identifier: number, cantidad: number, isLocalProductId = false): void {
    if (cantidad < 1) return; // Evitar cantidades en 0 o negativas
    
    if (this.authService.isAuthenticated() && !isLocalProductId) {
      const request: UpdateCartItemRequest = { cantidad };
      this.http.put<ApiResponse<CartResponse>>(`${environment.apiUrl}/cart/items/${identifier}`, request).subscribe({
        next: (res) => this.cart.set(res.data)
      });
    } else {
      let currentCart = this.cart();
      if (!currentCart) return;
      // En local, el identifier es el productId
      const item = currentCart.items.find(i => i.productId === identifier);
      if (item) {
        item.cantidad = cantidad;
        item.subtotal = item.cantidad * item.precioUnitario;
        this.updateLocalCartTotals(currentCart);
      }
    }
  }

  removeItem(identifier: number): void {
    // identifier puede ser el 'itemId' (BD) o el 'productId' (LocalStorage)
    if (this.authService.isAuthenticated()) {
      this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/cart/items/${identifier}`).subscribe({
        next: () => this.loadCart()
      });
    } else {
      this.removeLocalItem(identifier);
    }
  }

  clearCart(): void {
    if (this.authService.isAuthenticated()) {
      this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/cart/clear`).subscribe({
        next: () => this.cart.set(null)
      });
    } else {
      localStorage.removeItem(this.localCartKey);
      this.cart.set(null);
    }
  }

  // ==========================================
  // LÓGICA DE LOCAL STORAGE (INVITADOS)
  // ==========================================

  private loadLocalCart(): void {
    const localData = localStorage.getItem(this.localCartKey);
    if (localData) {
      this.cart.set(JSON.parse(localData));
    } else {
      this.cart.set({ items: [], totalItems: 0, subtotal: 0 });
    }
  }

  private addLocalItem(request: AddCartItemRequest, product: any): void {
    if (!product) {
      console.warn('Se necesitan los detalles del producto para el carrito local.');
      return;
    }

    let currentCart = this.cart() || { items: [], totalItems: 0, subtotal: 0 };
    const existingItem = currentCart.items.find(i => i.productId === request.productId);

    if (existingItem) {
      existingItem.cantidad += request.cantidad;
      existingItem.subtotal = existingItem.cantidad * existingItem.precioUnitario;
    } else {
      const newItem: CartItemResponse = {
        productId: request.productId,
        nombre: product.nombre,
        slug: product.slug,
        imagenPrincipalUrl: product.imagenPrincipalUrl,
        cantidad: request.cantidad,
        precioUnitario: product.precio,
        subtotal: product.precio * request.cantidad,
        stock: product.stock
      };
      currentCart.items.push(newItem);
    }

    this.updateLocalCartTotals(currentCart);
  }

  private removeLocalItem(productId: number): void {
    let currentCart = this.cart();
    if (!currentCart) return;

    currentCart.items = currentCart.items.filter(i => i.productId !== productId);
    this.updateLocalCartTotals(currentCart);
  }

  private updateLocalCartTotals(cart: CartResponse): void {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.cantidad, 0);
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    localStorage.setItem(this.localCartKey, JSON.stringify(cart));
    this.cart.set({...cart}); // Forzamos actualización del signal
  }

  // ==========================================
  // LÓGICA DE SINCRONIZACIÓN AL HACER LOGIN
  // ==========================================

  private syncGuestCartToBackend(): void {
    const localData = localStorage.getItem(this.localCartKey);
    
    if (!localData) {
      this.loadCart(); // Si no hay nada local, solo carga el carrito de su cuenta
      return;
    }

    const localCart: CartResponse = JSON.parse(localData);
    if (localCart.items.length === 0) {
      this.loadCart();
      return;
    }

    // Convertimos los items locales en peticiones al backend
    const requests: AddCartItemRequest[] = localCart.items.map(item => ({
      productId: item.productId,
      cantidad: item.cantidad
    }));

    // Enviamos los items uno por uno de forma ordenada (concatMap) para evitar colisiones en la BD
    from(requests).pipe(
      concatMap(req => this.http.post<ApiResponse<CartResponse>>(`${environment.apiUrl}/cart/items`, req))
    ).subscribe({
      complete: () => {
        // Cuando termina de sincronizar todo, borramos el local y pedimos el carrito final al backend
        localStorage.removeItem(this.localCartKey);
        this.loadCart();
      },
      error: (err) => console.error('Error sincronizando carrito', err)
    });
  }
}