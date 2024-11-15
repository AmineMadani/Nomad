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
import { CustomOAuthStorageService } from './core/services/customOAuthStorage.service';
import { BasemapOfflineService } from './core/services/basemapOffline.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot({ innerHTMLTemplatesEnabled: true }),
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
      useFactory: appConfigurationFactory,
      deps: [ConfigurationService, HttpClient],
      multi: true
    },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: OAuthStorage,
      useClass: CustomOAuthStorageService
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initAuthStorage,
      deps: [OAuthStorage],
      multi: true
    },
    BasemapOfflineService,
    {
      provide: APP_INITIALIZER,
      useFactory: initBasemapOffline,
      deps: [BasemapOfflineService],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }

export function appConfigurationFactory(appConfig: ConfigurationService) {
  return () => appConfig.ensureInit();
}

export function initAuthStorage(storage: CustomOAuthStorageService) {
  return () => storage.init();
}

export function initBasemapOffline(basemapOffline: BasemapOfflineService) {
  return () => basemapOffline.initializePlugin();
}

declare global {
  interface StringConstructor {
    removeAccents(value): string;
  }
}

String.removeAccents = function(value: string): string {
  if (!value) return '';

  var accent = [
    /[\300-\306]/g,
    /[\340-\346]/g, // A, a
    /[\310-\313]/g,
    /[\350-\353]/g, // E, e
    /[\314-\317]/g,
    /[\354-\357]/g, // I, i
    /[\322-\330]/g,
    /[\362-\370]/g, // O, o
    /[\331-\334]/g,
    /[\371-\374]/g, // U, u
    /[\321]/g,
    /[\361]/g, // N, n
    /[\307]/g,
    /[\347]/g // C, c
  ];
  var noaccent = ["A", "a", "E", "e", "I", "i", "O", "o", "U", "u", "N", "n", "C", "c"];

  var str = value;
  for (var i = 0; i < accent.length; i++) {
    str = str.replace(accent[i], noaccent[i]);
  }

  return str;
};
