import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'src/app/core/services/keycloak.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.page.html',
  styleUrls: ['./error.page.scss'],
})
export class ErrorPage implements OnInit {

  constructor(
    private router: Router,
    private keycloakService: KeycloakService
  ) { }

  ngOnInit() {
  }

  onRetry(){
    if (!this.keycloakService.hasValidToken()) {
      this.keycloakService.initialisation();
    }
    this.router.navigate(['home']);
  }

}
