import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { Favorite } from '../models/favorite.model';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<Favorite[]> {
    return this.http
      .get<ApiResponse<Favorite[]>>(`${environment.apiUrl}/favorites`)
      .pipe(map((response) => response.data));
  }
}