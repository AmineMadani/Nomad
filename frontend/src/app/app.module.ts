import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { OAuthModule, OAuthStorage } from 'angular-oauth2-oidc';
import { TokenInterceptor } from './core/interceptors/token.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { ConfigurationService } from './core/services/configuration.service';
import { DatePipe } from '@angular/common';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { customOAuthStorageService } from './core/services/customOAuthStorage.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    OAuthModule.forRoot(),
    ClipboardModule,
    
  ],
  providers: [
    DatePipe,
    ConfigurationService,
    {
      provide: APP_INITIALIZER,
      useFactory: AppConfigurationFactory,
      deps: [ConfigurationService, HttpClient],
      multi: true
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: OAuthStorage,
      useClass: customOAuthStorageService
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initAuthStorage,
      deps: [OAuthStorage],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }

export function AppConfigurationFactory(appConfig: ConfigurationService) {
  return () => appConfig.ensureInit();
}

export function initAuthStorage(storage: customOAuthStorageService) {
  return () => storage.init();
}
