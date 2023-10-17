import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { Contract, ContractWithOrganizationalUnits } from '../../models/contract.model';

@Injectable({
  providedIn: 'root',
})
export class ContractDataService {
  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService
  ) { }

  /**
    * Method to get all the contract from server
    * @returns Profiles
    */
  public getAllContracts(): Promise<Contract[]> {
    return firstValueFrom(
      this.http.get<Contract[]>(`${this.configurationService.apiUrl}contracts`)
    );
  }

  /**
    * Method to get all the contract with organizational units associated from server
    * @returns Profiles
    */
  public getAllContractsWithOrganizationalUnits(): Promise<ContractWithOrganizationalUnits[]> {
    return firstValueFrom(
      this.http.get<ContractWithOrganizationalUnits[]>(`${this.configurationService.apiUrl}contracts/organizational-units`)
    );
  }

  /**
   * Get a list of city ids by latitude and longitude
   * @param latitude The latitude
   * @param longitude The longitude
   * @returns A list of city id
   */
  public getContractIdsByLatitudeLongitude(latitude: number, longitude: number): Promise<number[]> {
    return firstValueFrom(
      this.http.get<number[]>(`${this.configurationService.apiUrl}contracts/coordinates?latitude=${latitude}&longitude=${longitude}`)
    );
  }
}


