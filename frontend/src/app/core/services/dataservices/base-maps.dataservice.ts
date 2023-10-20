import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService } from '../configuration.service';
import { Basemap } from '../../models/basemap.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BaseMapsDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) {}

  /**
   * Method to get all the user informations from server
   * @returns User information
   */
  public getBasemaps(): Promise<Basemap[]> {
    return firstValueFrom(
      this.http.get<Basemap[]>(`${this.configurationService.apiUrl}basemaps`)
    );
  }
}
