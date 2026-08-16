import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../../core/services/cart.service';
import { CartItemResponse } from '../../core/models/cart.model';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
  readonly cartService = inject(CartService);
  
  // Referencia directa al Signal del carrito en el servicio
  cart = this.cartService.cart;

  ngOnInit(): void {
    // Cuando el usuario entra a la página, cargamos los datos (sea del Backend o LocalStorage)
    this.cartService.loadCart();
  }

  formatPrice(price: number | undefined): string {
    if (price === undefined) return 'S/ 0.00';
    return `S/ ${price.toFixed(2)}`;
  }

  updateQuantity(item: CartItemResponse, change: number): void {
    const newQuantity = item.cantidad + change;
    
    // No permitimos que la cantidad sea menor a 1
    if (newQuantity < 1) return;
    
    // Si estamos logueados, el identifier será el itemId de la BD. Si no, será el productId
    const identifier = item.itemId ? item.itemId : item.productId;
    const isLocal = !item.itemId; 
    
    this.cartService.updateItemQuantity(identifier, newQuantity, isLocal);
  }

  removeItem(item: CartItemResponse): void {
    const identifier = item.itemId ? item.itemId : item.productId;
    this.cartService.removeItem(identifier);
  }
}