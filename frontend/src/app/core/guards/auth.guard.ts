import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { ConfigurationService } from '../services/configuration.service';
import { KeycloakService } from '../services/keycloak.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private keycloakService: KeycloakService,
    private userService: UserService,
    private configurationService: ConfigurationService
  ) { }
  
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    if(!this.keycloakService.hasValidToken() && this.configurationService.keycloak.active) {
      if(route.routeConfig?.path != "login"){
        this.router.navigate(['login']);
        return false;
      }
    } else {
      const user = await this.userService.getUser();
      if(user) {
        if(route.routeConfig?.path == "login"){
          this.router.navigate(['home']);
          return false;
        }
      } else {
        this.router.navigate(['error']);
        return false;
      }
    }

    return true;
  }
}
