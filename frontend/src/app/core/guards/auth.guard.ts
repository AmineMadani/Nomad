import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { ConfigurationService } from '../services/configuration.service';
import { KeycloakService } from '../services/keycloak.service';
import { UserService } from '../services/user.service';
import { InitService } from '../services/init.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private keycloakService: KeycloakService,
    private userService: UserService,
    private configurationService: ConfigurationService,
    private initService: InitService
  ) { }

  /**
 * Determines whether the user can activate a particular route.
 * @param route The activated route to check.
 * @param state The router state to check.
 * @returns A promise that resolves to a boolean indicating if the user can activate the route.
 */
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    // If the user doesn't have a valid token and Keycloak is active
    if (!this.keycloakService.hasValidToken()) {
      // If the user isn't trying to access the login page, redirect them to the login page
      if (route.routeConfig?.path !== 'login') {
        this.router.navigate(['login']);
        return false;
      }
    } else {
      // Try to get the user data
      const user = await this.userService.getUser();

      if (user) {
        // Get initialization data for the user
        const isComplete: boolean = await this.initService.getInitData(user.id);

        // If the user is on the login page and initialization is complete, redirect them to the home page
        if (route.routeConfig?.path === 'login' && isComplete) {
          this.router.navigate(['home']);
          return false;
        }
        // If initialization is incomplete, redirect the user to the error page
        else if (!isComplete) {
          this.router.navigate(['error']);
          return false;
        }
      }
      // If user data cannot be retrieved, redirect the user to the error page
      else {
        this.router.navigate(['error']);
        return false;
      }
    }

    // Return true to indicate the user can activate the route
    return true;
  }
}
