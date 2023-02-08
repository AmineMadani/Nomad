import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
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
  ) {}

  ngOnInit(): void {
    if(environment.keycloak.active) {
      this.keycloakService.initialisation();
    }
  }
}
