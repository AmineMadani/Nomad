import { Platform } from '@angular/cdk/platform';
import { Injectable, NgZone } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  public userProfile: any;
  public hasValidAccessToken = false;
  public realmRoles: string[] = [];

  constructor(
    private oauthService: OAuthService,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    private platform: Platform,
    private router: Router) {
    if(environment.keycloak.active) {
      if (this.platform.IOS) {
        this.configureIOS();
      } else if (this.platform.isBrowser) {
        this.configureWeb();
      } else {
        alert("This platform is not supported.")
      }
    }
  }

  initialisation() {
    this.oauthService.loadDiscoveryDocument().then(loadDiscoveryDocumentResult => {
      this.hasValidAccessToken = this.oauthService.hasValidAccessToken();
      this.oauthService.tryLogin().then(tryLoginResult => {
        if (this.hasValidAccessToken) {
          this.loadUserProfile();
          this.realmRoles = this.getRealmRoles();
        } else {
          this.login();
        }
      });
    }).catch(error => {
      console.error("loadDiscoveryDocument", error);
    });

    this.oauthService.events.subscribe(eventResult => {
      console.log("isvalid token : ", this.oauthService.hasValidAccessToken());
      if (eventResult.type == 'token_refreshed') {
        console.log("token : " + this.oauthService.getAccessToken());
      }
      this.hasValidAccessToken = this.oauthService.hasValidAccessToken();
    })
  }

  public hasValidToken(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  public login(): void {
    this.oauthService.loadDiscoveryDocumentAndLogin()
      .then(loadDiscoveryDocumentAndLoginResult => {
        console.log("loadDiscoveryDocumentAndLogin", loadDiscoveryDocumentAndLoginResult);
      })
      .catch(error => {
        console.error("loadDiscoveryDocumentAndLogin", error);
      });
  }

  public logout(): void {
    this.oauthService.revokeTokenAndLogout()
      .then(revokeTokenAndLogoutResult => {
        console.log("revokeTokenAndLogout", revokeTokenAndLogoutResult);
        this.userProfile = null;
        this.realmRoles = [];
      })
      .catch(error => {
        console.error("revokeTokenAndLogout", error);
      });
  }

  public loadUserProfile(): void {
    this.oauthService.loadUserProfile()
      .then(loadUserProfileResult => {
        //console.log("loadUserProfile", loadUserProfileResult);
        this.userProfile = loadUserProfileResult;
      })
      .catch(error => {
        console.error("loadUserProfile", error);
      });
  }

  public getRealmRoles(): string[] {
    let idClaims = this.oauthService.getIdentityClaims()
    if (!idClaims) {
      console.error("Couldn't get identity claims, make sure the user is signed in.")
      return [];
    }
    if (!idClaims.hasOwnProperty("realm_roles")) {
      console.error("Keycloak didn't provide realm_roles in the token. Have you configured the predefined mapper realm roles correct?")
      return [];
    }

    let realmRoles = idClaims["realm_roles"]
    return realmRoles ?? [];
  }

  private configureWeb(): void {
    console.log("Using web configuration")
    let authConfig: AuthConfig = {
      issuer: environment.keycloak.issuer,
      redirectUri: environment.keycloak.redirectUri,
      clientId: environment.keycloak.clientId,
      responseType: 'code',
      scope: 'openid profile email offline_access',
      revocationEndpoint: environment.keycloak.revocationEndpoint,
      showDebugInformation: true,
      requireHttps: false
    }
    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();
  }

  private configureIOS(): void {
    //console.log("Using iOS configuration")
    let authConfig: AuthConfig = {
      issuer: environment.keycloak.issuer,
      redirectUri: environment.keycloak.redirectUriIos,
      clientId: environment.keycloak.clientId,
      responseType: 'code',
      scope: 'openid profile email offline_access',
      revocationEndpoint: environment.keycloak.revocationEndpoint,
      showDebugInformation: true,
      requireHttps: false
    }
    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      let url = new URL(event.url);
      if (url.host != "login") {
        return;
      }

      this.zone.run(() => {
        const queryParams: Params = {};
        for (const [key, value] of url.searchParams.entries()) {
          queryParams[key] = value;
        }

        this.router.navigate(
          [],
          {
            relativeTo: this.activatedRoute,
            queryParams: queryParams,
            queryParamsHandling: 'merge', 
          })
          .then(navigateResult => {
            this.oauthService.tryLogin().then(tryLoginResult => {
              if (this.hasValidAccessToken) {
                this.loadUserProfile();
                this.realmRoles = this.getRealmRoles();
              }
            })
          })
          .catch(error => console.error(error));

      });
    });
  }
}
