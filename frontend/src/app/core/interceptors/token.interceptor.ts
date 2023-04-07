import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigurationService } from '../services/configuration.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private configurationService: ConfigurationService
  ) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const isApiUrl = request.url.startsWith(this.configurationService.apiUrl);
    const token = sessionStorage.getItem('access_token');
    if (isApiUrl && token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(request);
  }
}
