import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigurationService } from '../services/configuration.service';
import { KeycloakService } from '../services/keycloak.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private configurationService: ConfigurationService,
    private keycloakService: KeycloakService
  ) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const isApiUrl = request.url.startsWith(this.configurationService.apiUrl);
    const isExternalApiUrl = request.url.startsWith(this.configurationService.externalApiUrl);
    const token = this.keycloakService.getAccessToken();
    if ((isApiUrl || isExternalApiUrl) && token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(request);
  }
}
