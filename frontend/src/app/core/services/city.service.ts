import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CityDataService } from './dataservices/city.dataservice';
import { City } from '../models/city.model';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  constructor(
    private cityDataService: CityDataService
  ) { }

  getAllCities(): Observable<City[]> {
    return this.cityDataService.getAllCities();
  }

  /**
   * Get a list of city ids by latitude and longitude
   * @param latitude The latitude
   * @param longitude The longitude
   * @returns A list of city id
   */
  getCityIdsByLatitudeLongitude(latitude: number, longitude: number): Observable<number[]> {
    return this.cityDataService.getCityIdsByLatitudeLongitude(latitude, longitude);
  }
}
