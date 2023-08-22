import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { ContractWithOrganizationalUnits } from '../../models/contract.model';

@Injectable({
  providedIn: 'root',
})
export class ContractDataService {
  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) { }

  /**
    * Method to get all the contract with organizational units associated from server
    * @returns Profiles
    */
  getAllContractsWithOrganizationalUnits(): Observable<ContractWithOrganizationalUnits[]> {
    return this.http.get<ContractWithOrganizationalUnits[]>(`${this.configurationService.apiUrl}contracts`);
  }
}


