import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { environment } from 'src/environments/environment';
import { KeycloakService } from './keycloak.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private keycloakService: KeycloakService
  ) { }
  
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    

    if(!this.keycloakService.hasValidToken() && environment.keycloak.active) {
      if(route.routeConfig?.path != "error"){
        this.router.navigate(['error']);
        return false;
      }
    } else {
      if(route.routeConfig?.path == "error"){
        this.router.navigate(['home']);
        return false;
      }
    }

    return true;
  }
}
