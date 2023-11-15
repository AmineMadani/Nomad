import { Platform } from '@angular/cdk/platform';
import { Injectable, NgZone } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { AuthConfig, OAuthService, TokenResponse } from 'angular-oauth2-oidc';
import { ConfigurationService } from './configuration.service';
import { UserService } from './user.service';
import { PraxedoService } from './praxedo.service';

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
    private router: Router,
    private praxedoService: PraxedoService) 
  {}

  public userProfile: any;
  public realmRoles: string[] = [];
  public initialState: string | undefined;
  private mobileUrlState: string | undefined;
  private isOauthServiceInitialized = false;

  configure(){
    if(this.configurationService.keycloak.active) {
      if (this.platform.ANDROID) {
        this.configureAndroid();
      } else if (this.platform.isBrowser) {
        this.configureWeb();
      } else {
        alert("This platform is not supported.")
      }
    }
  }

  initialisation() {
    this.oauthService.events.subscribe(eventResult => {
      if(eventResult.type == 'token_received') {
        if(this.oauthService.state) {
          this.router.navigateByUrl(decodeURIComponent(this.oauthService.state));
          this.oauthService.state=null;
        }
      }
    })
      
    if (this.oauthService.getRefreshToken() && this.isTokenExpired()) {
      this.refreshToken();
    }
  }

  public hasValidToken(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  public async refreshToken(): Promise<TokenResponse> {
    try {
      if(!this.isOauthServiceInitialized) {
        await this.oauthService.loadDiscoveryDocument();
        await this.oauthService.tryLogin();
        this.isOauthServiceInitialized = true;
      }
    } catch(error) {
      console.error("OAuth initialisation issue",error);
    }
    return this.oauthService.refreshToken();
  }

  public getRefreshToken(): String {
    return this.oauthService.getRefreshToken();
  }

  public isTokenExpired(): boolean {
    return this.oauthService.getIdTokenExpiration() < new Date().getTime();
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

  private configureWeb(): void {
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

    this.praxedoService.praxedoListener();

    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      let url = new URL(event.url);
      if (url.host != this.configurationService.host.replace('https://','').slice(0, -1)) {
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
            if(!this.praxedoService.externalReport) {
              if(!url.href.replace(url.origin,'').includes('/login')) {
                this.router.navigateByUrl(url.href.replace(url.origin,''));
              } else {
                if(this.mobileUrlState){
                  this.router.navigateByUrl(this.mobileUrlState);
                  this.mobileUrlState=undefined;
                }
              }
            } else {
              if(this.mobileUrlState){
                this.mobileUrlState=undefined;
              }
              this.router.navigate(["/home/workorder/"+this.praxedoService.externalReport+"/cr"]);
            }
          })
          .catch(error => console.error(error));
      });
    });
  }

  /**
   * Get access token
   * @returns Access token
   */
  public getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }
}
