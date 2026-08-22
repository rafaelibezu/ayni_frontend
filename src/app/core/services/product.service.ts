import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);

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