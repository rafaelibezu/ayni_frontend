import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<Category[]> {
    return this.http
      .get<ApiResponse<Category[]>>(`${environment.apiUrl}/categories`)
      .pipe(map((response) => response.data));
  }
}