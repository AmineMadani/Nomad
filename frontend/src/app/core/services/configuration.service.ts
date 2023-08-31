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
  revocationEndpoint: string
}

@Injectable()
export class ConfigurationService {

  apiUrl: string;
  externalApiUrl: string;
  host: string;
  keycloak: Keycloak;
  offlineTimeout: number;
  

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
          this.externalApiUrl = response.body.externalApiUrl;
          this.keycloak= response.body.keycloak;
          this.host = response.body.host;
          this.offlineTimeout = response.body.offlineTimeout;

          resolve(this);
        },
        error: (err) => {reject(err)}
      });
    });
  }
}
