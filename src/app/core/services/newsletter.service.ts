import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import {
  NewsletterSubscribeRequest,
  NewsletterSubscriber,
} from '../models/newsletter.model';

@Injectable({
  providedIn: 'root',
})
export class NewsletterService {
  private readonly http = inject(HttpClient);

  subscribe(request: NewsletterSubscribeRequest): Observable<NewsletterSubscriber> {
    return this.http
      .post<ApiResponse<NewsletterSubscriber>>(
        `${environment.apiUrl}/newsletter/subscribe`,
        request
      )
      .pipe(map((response) => response.data));
  }
}