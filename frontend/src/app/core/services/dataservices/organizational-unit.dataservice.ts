import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { OrganizationalUnit } from '../../models/organizational-unit.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationalUnitDataService {
  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) {}

  /**
   * Method to get all the organizational units
   * @returns OrganizationalUnit[]
   */
  getAllOrganizationalUnits(): Observable<OrganizationalUnit[]> {
    return this.http.get<OrganizationalUnit[]>(`${this.configurationService.apiUrl}organizational-units`);
  }
}


