import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { AddCartItemRequest, Cart } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly http = inject(HttpClient);

  findMyCart(): Observable<Cart> {
    return this.http
      .get<ApiResponse<Cart>>(`${environment.apiUrl}/cart`)
      .pipe(map((response) => response.data));
  }

  addItem(request: AddCartItemRequest): Observable<Cart> {
    return this.http
      .post<ApiResponse<Cart>>(`${environment.apiUrl}/cart/items`, request)
      .pipe(map((response) => response.data));
  }

  updateItem(itemId: number, cantidad: number): Observable<Cart> {
    return this.http
      .put<ApiResponse<Cart>>(`${environment.apiUrl}/cart/items/${itemId}`, { cantidad })
      .pipe(map((response) => response.data));
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http
      .delete<ApiResponse<Cart>>(`${environment.apiUrl}/cart/items/${itemId}`)
      .pipe(map((response) => response.data));
  }

  clear(): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${environment.apiUrl}/cart/clear`)
      .pipe(map(() => undefined));
  }
}
