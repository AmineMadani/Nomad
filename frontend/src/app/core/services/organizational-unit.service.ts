import { Injectable } from "@angular/core";
import { OrganizationalUnitDataService } from "./dataservices/organizational-unit.dataservice";
import { Observable } from "rxjs";
import { OrganizationalUnit } from "../models/organizational-unit.model";

@Injectable({
  providedIn: 'root'
})
export class OrganizationalUnitService {
  constructor(
    private organizationalUnitDataService: OrganizationalUnitDataService
  ) { }

  /**
   * Method to get all the organizational units
   * @returns OrganizationalUnit[]
   */
  getAllOrganizationalUnits(): Observable<OrganizationalUnit[]> {
    return this.organizationalUnitDataService.getAllOrganizationalUnits();
  }
}
