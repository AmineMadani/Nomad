import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { City } from '../../models/city.model';

@Injectable({
  providedIn: 'root',
})
export class CityDataService {
  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) { }

  /**
    * Method to get all the cities from the server
    * @returns Profiles
    */
  public getAllCities(): Promise<City[]> {
    return firstValueFrom(
      this.http.get<City[]>(`${this.configurationService.apiUrl}cities`)
    );
  }

  /**
   * Get a list of city ids by latitude and longitude
   * @param latitude The latitude
   * @param longitude The longitude
   * @returns A list of city id
   */
  public getCityIdsByLatitudeLongitude(latitude: number, longitude: number): Promise<number[]> {
    return firstValueFrom(
      this.http.get<number[]>(`${this.configurationService.apiUrl}cities/coordinates?latitude=${latitude}&longitude=${longitude}`)
    );
  }

  /**
   * Get adresses by query
   * @param query the string query
   * @returns the adresses
   */
  public getAdressesByQuery(query: string): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(this.configurationService.apiAdressesUrl.replace('{query}', query))
    );
  }
}


