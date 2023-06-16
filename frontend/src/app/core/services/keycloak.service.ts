import { Platform } from '@angular/cdk/platform';
import { Injectable, NgZone } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { ConfigurationService } from './configuration.service';
import { LocalStorageService } from './local-storage.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  constructor(
    private oauthService: OAuthService,
    private activatedRoute: ActivatedRoute,
    private zone: NgZone,
    private configurationService: ConfigurationService,
    private userService: UserService,
    private platform: Platform,
    private router: Router) 
  {}

  public userProfile: any;
  public realmRoles: string[] = [];
  public initialState: string | undefined;
  private mobileUrlState: string | undefined;

  configure(){
    if(this.configurationService.keycloak.active) {
      if (this.platform.IOS) {
        this.configureIOS();
      } else if (this.platform.ANDROID) {
        this.configureAndroid();
      } else if (this.platform.isBrowser) {
        this.configureWeb();
      } else {
        alert("This platform is not supported.")
      }
    }
  }

  initialisation() {
    if(this.configurationService.keycloak.active) {
      this.oauthService.events.subscribe(eventResult => {
        if (eventResult.type == 'token_refreshed') {
          console.log("token : " + this.oauthService.getAccessToken());
        }
        if(eventResult.type == 'token_received') {
          console.log("token : " + this.oauthService.getAccessToken());
          this.router.navigateByUrl(decodeURIComponent(this.oauthService.state));
        }
      })
      
      this.oauthService.loadDiscoveryDocument().then(loadDiscoveryDocumentResult => {
        this.oauthService.tryLogin().then(tryLoginResult => {
          //console.log(tryLoginResult)
          if (this.oauthService.hasValidAccessToken()) {
            this.loadUserProfile();
            this.realmRoles = this.getRealmRoles();
          }
        }).catch(err => {
          this.router.navigate(["/error"]);
        });
      }).catch(error => {
        console.error("loadDiscoveryDocument", error);
        this.router.navigate(["/error"]);
      });
    }
  }

  public hasValidToken(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  public login(): void {
    this.oauthService.loadDiscoveryDocumentAndLogin({state:this.initialState})
      .then(loadDiscoveryDocumentAndLoginResult => {
        console.log("loadDiscoveryDocumentAndLogin", loadDiscoveryDocumentAndLoginResult);
      })
      .catch(error => {
        console.error("loadDiscoveryDocumentAndLogin", error);
      });
  }

  public logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.oauthService.revokeTokenAndLogout()
        .then(revokeTokenAndLogoutResult => {
          this.userProfile = null;
          this.realmRoles = [];
          this.userService.resetUser();
          resolve(revokeTokenAndLogoutResult);
        })
        .catch(error => {
          console.error("revokeTokenAndLogout", error);
          reject(error);
        });
    })
  }

  public loadUserProfile(): void {
    this.oauthService.loadUserProfile()
      .then(loadUserProfileResult => {
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
      issuer: this.configurationService.keycloak.issuer,
      redirectUri: this.configurationService.keycloak.redirectUri,
      clientId: this.configurationService.keycloak.clientId,
      responseType: 'code',
      scope: 'openid profile email offline_access',
      revocationEndpoint: this.configurationService.keycloak.revocationEndpoint,
      showDebugInformation: true,
      requireHttps: false
    }
    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();
  }

  private configureIOS(): void {
    let authConfig: AuthConfig = {
      issuer: this.configurationService.keycloak.issuer,
      redirectUri: this.configurationService.keycloak.redirectUriIos,
      clientId: this.configurationService.keycloak.clientId,
      responseType: 'code',
      scope: 'openid profile email offline_access',
      revocationEndpoint: this.configurationService.keycloak.revocationEndpoint,
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
              if (this.oauthService.hasValidAccessToken()) {
                this.loadUserProfile();
                this.realmRoles = this.getRealmRoles();
              }
            })
          })
          .catch(error => console.error(error));

      });
    });
  }

  private configureAndroid(): void {
    let authConfig: AuthConfig = {
      issuer: this.configurationService.keycloak.issuer,
      redirectUri: this.configurationService.keycloak.redirectUriAndroid,
      clientId: this.configurationService.keycloak.clientId,
      responseType: 'code',
      scope: 'openid profile email offline_access',
      revocationEndpoint: this.configurationService.keycloak.revocationEndpoint,
      showDebugInformation: true,
      requireHttps: false
    }
    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      let url = new URL(event.url);
      if (url.host != "nomad-dev.hp.m-ve.com") {
        // Only interested in redirects to myschema://login
        return;
      } else {
        if(!this.oauthService.hasValidAccessToken()){
          if(!url.href.replace(url.origin,'').includes('/login')) {
            this.mobileUrlState=url.href.replace(url.origin,''); //Save the last state url in mobile case
          }
        }
      }

      this.zone.run(() => {

        // Building a query param object for Angular Router
        const queryParams: Params = {};
        for (const [key, value] of url.searchParams.entries()) {
          queryParams[key] = value;
        }

        // Add query params to current route
        this.router.navigate(
          [],
          {
            relativeTo: this.activatedRoute,
            queryParams: queryParams,
            queryParamsHandling: 'merge', // remove to replace all query params by provided
          })
          .then(navigateResult => {
            // After updating the route, trigger login in oauthlib and
            this.oauthService.tryLogin().then(tryLoginResult => {
              if (this.oauthService.hasValidAccessToken()) {
                if(!url.href.replace(url.origin,'').includes('/login')) {
                  this.router.navigateByUrl(url.href.replace(url.origin,''));
                } else {
                  if(this.mobileUrlState){
                    this.router.navigateByUrl(this.mobileUrlState);
                    this.mobileUrlState=undefined;
                  }
                }
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
