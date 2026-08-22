import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Product } from '../models/product.model';

// Interfaz para la paginación que devuelve Spring Boot
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

  // Nuevo método para el Catálogo (Paginado y Filtrado)
  findAll(category?: string, page: number = 0, size: number = 12): Observable<Page<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (category) {
      params = params.set('category', category);
    }

    return this.http
      .get<ApiResponse<Page<Product>>>(`${environment.apiUrl}/products`, { params })
      .pipe(map((response) => response.data));
  }

  findFeatured(): Observable<Product[]> {
    return this.http
      .get<ApiResponse<Product[]>>(`${environment.apiUrl}/products/featured`)
      .pipe(map((response) => response.data));
  }

  findBySlug(slug: string): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${environment.apiUrl}/products/${slug}`)
      .pipe(map((response) => response.data));
  }
}