import { Component, OnInit } from '@angular/core';
import { switchMap, from, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ITiles } from './models/app-db.model';
import { CacheService } from './services/cache.service';
import { KeycloakService } from './services/keycloak.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public appPages = [
    { title: 'Accueil', url: '/home', icon: 'home' },
    { title: 'Analyse et reporting', url: '/report', icon: 'globe' },
    { title: 'Paramètres', url: '/settings', icon: 'settings' },
  ];
  constructor(
    private keycloakService: KeycloakService,
    private cacheService: CacheService,
  ) {}

  ngOnInit(): void {

    console.log(this.keycloakService.hasValidToken());
    if(this.keycloakService.hasValidToken()) {
      from(this.cacheService.cacheIsAlreadySet()).pipe(
        switchMap((cacheSet: boolean) => {
          return cacheSet ? of(cacheSet) : this.cacheService.loadZips();
        })
      ).subscribe(() => {
        this.cacheService.setCacheLoaded(true);
      });
    } else {
      this.keycloakService.initialisation();
    }

  }
}
