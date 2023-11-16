import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ApiErrorResponse } from '../models/api-response.model';
import { ToastController } from '@ionic/angular';
import { ConfigurationService } from '../services/configuration.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private userService: UserService,
    private toastController: ToastController,
    private configurationService: ConfigurationService,
  ) {}

  public intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(async (err: HttpErrorResponse) => {
        if (err.status === 401) {
          // Only for nomad backend
          const isApiUrl = request.url.startsWith(this.configurationService.apiUrl);
          if (isApiUrl) {
            this.userService.resetUser();
            this.router.navigate(['/error'],{queryParams:{error:'not_authorized'}});
          }
        }
        // If an error functional or technical appear, it shows a toast
        if ((err.status === 400 || err.status === 500)) {
          const apiError: ApiErrorResponse = err.error;
          const toast = await this.toastController.create({
            message: apiError.message ? apiError.message:apiError.error_description,
            duration: 2000,
            color: err.status === 400 ? 'warning' : 'danger'
          });
          await toast.present();
        }
        throw err;
      })
    );
  }
}
