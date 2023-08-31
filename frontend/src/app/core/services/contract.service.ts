import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Contract, ContractWithOrganizationalUnits } from '../models/contract.model';
import { ContractDataService } from './dataservices/contract.dataservice';
import { CacheService, ReferentialCacheKey } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  constructor(
    private contractDataService: ContractDataService,
    private cacheService: CacheService
  ) {
  }

  getAllContracts(): Observable<Contract[]> {
    return this.cacheService.fetchReferentialsData<Contract[]>(
      ReferentialCacheKey.CONTRACTS,
      () => this.contractDataService.getAllContracts()
    );
  }

  /**
    * Method to get all the contract with organizational units associated from server
    * @returns Profiles
    */
  getAllContractsWithOrganizationalUnits(): Observable<ContractWithOrganizationalUnits[]> {
    return this.contractDataService.getAllContractsWithOrganizationalUnits();
  }

  /**
   * Get a list of contract ids by latitude and longitude
   * @param latitude The latitude
   * @param longitude The longitude
   * @returns A list of contract id
   */
  getContractIdsByLatitudeLongitude(latitude: number, longitude: number): Observable<number[]> {
    return this.contractDataService.getContractIdsByLatitudeLongitude(latitude, longitude);
  }
}
