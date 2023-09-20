import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { KeycloakService } from '../services/keycloak.service';
import { InitService } from '../services/init.service';
import { UserService } from '../services/user.service';
import { UtilsService } from '../services/utils.service';
import { PreferenceService } from '../services/preference.service';
import { PermissionCodeEnum } from '../models/user.model';

/**
 * Determines whether the user can activate a particular route.
 * @param route The activated route to check.
 * @param state The router state to check.
 * @returns A promise that resolves to a boolean indicating if the user can activate the route.
 */
export const AuthGuard = async (route: ActivatedRouteSnapshot) => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);
  const userService = inject(UserService);
  const initService = inject(InitService);

  // If the user doesn't have a valid token and Keycloak is active
  if (!keycloakService.hasValidToken()) {
    // If the user isn't trying to access the login page, redirect them to the login page
    if (route.routeConfig?.path !== 'login') {
      keycloakService.initialState = window.location.pathname + window.location.search;
      router.navigate(['login']);
      return false;
    }
  } else {
    // Try to get the user data
    const user = await userService.getCurrentUser();

    if (user) {
      try {
        await initService.getInitData();
      } catch (e) {
        router.navigate(['error']);
        return false;
      }

      // If the user is on the login page and initialization is complete, redirect them to the home page
      if (route.routeConfig?.path === 'login') {
        router.navigate(['home']);
        return false;
      }

      // Check for route permissions
      const authorizedPermissions: PermissionCodeEnum[] = route.data['authorizedPermissions'];
      if (authorizedPermissions) {
        const hasPermission = await userService.currentUserHasAnyPermission(authorizedPermissions);
        if (!hasPermission) {
          router.navigate(['home']);
          return false;
        }
      }
    }
    // If user data cannot be retrieved, redirect the user to the error page
    else {
      router.navigate(['error']);
      return false;
    }
  }

  // Return true to indicate the user can activate the route
  return true;
}
