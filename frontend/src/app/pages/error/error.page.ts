import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'src/app/services/keycloak.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.page.html',
  styleUrls: ['./error.page.scss'],
})
export class ErrorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  retryAuthent(){
    window.location.href = '/';
  }

}
