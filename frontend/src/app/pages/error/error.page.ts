import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeycloakService } from 'src/app/core/services/keycloak.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.page.html',
  styleUrls: ['./error.page.scss'],
})
export class ErrorPage implements OnInit {

  constructor(
    private router: Router,
    private keycloakService: KeycloakService,
    private userService: UserService,
    private route: ActivatedRoute
  ) { }

  public global: string = 'global';
  public errorTitle: string = 'Inconnue';
  public errorMessage: string = 'Une erreur inconnue est survenue. Veuillez contacter votre responsable si le problème persiste.';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if(params['error'] && params['error'] == 'invalid_grant') {
        this.global='invalid_grant';
        this.errorTitle = 'Token de connexion invalide';
        this.errorMessage = 'Une erreur de session est survenue. Veuillez vous reconnecter en cliquant sur le bouton ci-dessous. Si le problème persiste, contacter votre responsable.'
      }
      if(params['error'] && params['error'] == 'not_authorized') {
        this.global='not_authorized';
        this.errorTitle = 'Compte non autorisé';
        this.errorMessage = "Votre compte n'est pas autorisé. Veuillez vous rapprocher de votre responsable."
      }
      if(params['error'] && params['error'] == 'keycloak_off') {
        this.global='keycloak_off';
        this.errorTitle = "Service d'authentification indisponible";
        this.errorMessage = "Le service d'authentification semble indisponible. Veuillez vous rapprocher de votre responsable."
      }
    })
  }

  onRetry(){
    if(this.global == 'invalid_grant') {
      this.userService.resetLocalSession();
      window.location.href='/home';
    } else {
      if (!this.keycloakService.hasValidToken()) {
        this.keycloakService.initialisation();
      }
      this.router.navigate(['home']);
    }
  }

}
