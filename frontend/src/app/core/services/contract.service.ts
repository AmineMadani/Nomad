import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
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

  contracts: Contract[];

  async getAllContracts(forceGetFromDb: boolean = false): Promise<Contract[]> {
    if (!this.contracts || forceGetFromDb) {
      this.contracts = await this.cacheService.fetchReferentialsData<Contract[]>(
        ReferentialCacheKey.CONTRACTS,
        () => this.contractDataService.getAllContracts()
      );
    }

    return this.contracts;
  }

  /**
    * Method to get all the contract with organizational units associated from server
    * @returns Profiles
    */
  getAllContractsWithOrganizationalUnits(): Promise<ContractWithOrganizationalUnits[]> {
    return this.contractDataService.getAllContractsWithOrganizationalUnits();
  }

  /**
   * Get a list of contract ids by latitude and longitude
   * @param latitude The latitude
   * @param longitude The longitude
   * @returns A list of contract id
   */
  getContractIdsByLatitudeLongitude(latitude: number, longitude: number): Promise<number[]> {
    return this.contractDataService.getContractIdsByLatitudeLongitude(latitude, longitude);
  }
}
