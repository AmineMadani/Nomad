import { HttpClient } from "@angular/common/http";
import { ConfigurationService } from "../configuration.service";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { TreeData } from "../../models/filter/filter-component-models/TreeFilter.model";

@Injectable({
    providedIn: 'root',
  })
export class TreeDataService{
    constructor(
      private http: HttpClient,
      private configurationService: ConfigurationService  
    ) {}

    /**
     * Method to get all the user informations from server
     * @returns User information
     */
    getDefaultTree(): Observable<TreeData[]> {
    return this.http.get<TreeData[]>(`${this.configurationService.apiUrl}tree/default`);
  }
}
