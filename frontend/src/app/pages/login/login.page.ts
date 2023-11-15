import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'src/app/core/services/keycloak.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private keycloakService: KeycloakService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.keycloakService.login();
    }, 2000);
  }

}
