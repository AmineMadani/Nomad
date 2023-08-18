import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContractWithOrganizationalUnits } from '../models/contract.model';
import { ContractDataService } from './dataservices/contract.dataservice';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor(
    private contractDataService: ContractDataService
  ) { }

  /**
    * Method to get all the contract with organizational units associated from server
    * @returns Profiles
    */
  getAllContractsWithOrganizationalUnits(): Observable<ContractWithOrganizationalUnits[]> {
    return this.contractDataService.getAllContractsWithOrganizationalUnits();
  }

}
