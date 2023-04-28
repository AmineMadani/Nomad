import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

export interface Keycloak {
  active: boolean,
  issuer: string,
  redirectUri: string,
  redirectUriIos: string,
  redirectUriAndroid: string,
  clientId: string,
  revocationEndpoint: string,
  hitTolerance: number
}

@Injectable()
export class ConfigurationService {

  apiUrl: string;
  keycloak: Keycloak
  

  constructor(
    private httpClient: HttpClient
  ) {}

  /**
   * Ensure that the configurations are initialized before using them
   * @returns The configuration
   */
  ensureInit(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Config
      this.httpClient.get("./assets/config/config"+environment.env+".json", {observe: 'response'}).subscribe({
        next: (response: any) => { 
          this.apiUrl = response.body.apiUrl;
          this.keycloak= response.body.keycloak;
          resolve(this);
        },
        error: (err) => {reject(err)}
      });
    });
  }
}
