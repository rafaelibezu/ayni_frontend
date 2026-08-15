import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  getMe(): Observable<UserProfile> {
    return this.http
      .get<ApiResponse<UserProfile>>(`${environment.apiUrl}/users/me`)
      .pipe(map((response) => response.data));
  }
}