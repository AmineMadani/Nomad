import { Component, Input, OnInit } from '@angular/core';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-main-toolbar',
  templateUrl: './main-toolbar.component.html',
  styleUrls: ['./main-toolbar.component.scss'],
})
export class MainToolbarComponent implements OnInit {

  @Input("title") title: string;

  constructor(
    private keycloakService: KeycloakService,
  ) { }

  ngOnInit() {}

  logout() {
    if(environment.keycloak.active) {
      this.keycloakService.logout();
    }
  }

}
