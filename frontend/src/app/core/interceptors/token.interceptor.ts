import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, from, lastValueFrom } from 'rxjs';
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
    return from(this.handle(request, next))
  }

  async handle(req: HttpRequest<any>, next: HttpHandler) {
    const isApiUrl = req.url.startsWith(this.configurationService.apiUrl);
    const isExternalApiUrl = req.url.startsWith(this.configurationService.externalApiUrl);
    if ((isApiUrl || isExternalApiUrl)) {
      if(this.keycloakService.getRefreshToken() && this.keycloakService.isTokenExpired()){
        try {
          await this.keycloakService.refreshToken();
        } catch (error) {
          console.error("Error token refreshed in interceptor",error);
        }
      }
      const token = this.keycloakService.getAccessToken();
      if(token){
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }

    return await lastValueFrom(next.handle(req));
  }
}
