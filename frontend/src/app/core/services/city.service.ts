import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { CityDataService } from './dataservices/city.dataservice';
import { City } from '../models/city.model';
import { CacheService, ReferentialCacheKey } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  constructor(
    private cityDataService: CityDataService,
    private cacheService: CacheService
  ) {
  }

  cities: City[];

  getAllCities(forceGetFromDb: boolean = false): Observable<City[]> {
    if (this.cities && !forceGetFromDb) {
      return of(this.cities);
    }

    return this.cacheService.fetchReferentialsData<City[]>(
      ReferentialCacheKey.CITIES,
      () => this.cityDataService.getAllCities()
    ).pipe(
      tap((results => this.cities = results))
    );
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

  /**
   * Get a list off adress by string query
   * @param query string query
   * @returns list of adresses
   */
  getAdressesByQuery(query: string): any {
    query = query.replace(' ','+');
    query = 'search/?q='+query+'&limit=5';
    return this.cityDataService.getAdressesByQuery(query);
  }

  /**
   * Get a adress by x and y
   * @param x longitude
   * @param y latitude
   * @returns the adress
   */
  getAdressByXY(x:number, y:number): any {
    const query = 'reverse/?lon=' + x + '&lat=' + y + '';
    return this.cityDataService.getAdressesByQuery(query);
  }
}
