import { HttpClient } from "@angular/common/http";
import { ConfigurationService } from "../configuration.service";
import { Injectable } from "@angular/core";
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { TreeData } from "../../models/filter/filter-component-models/TreeFilter.model";
import { AppDB } from "../../models/app-db.model";

@Injectable({
    providedIn: 'root',
  })
export class TreeDataService{
  private db: AppDB;
    constructor(
      private http: HttpClient,
      private configurationService: ConfigurationService  
    ) {
      this.db = new AppDB();
    }

    /**
     * Method to get all the user informations from server
     * @returns User information
     */
    public async  getDefaultTree(): Promise<TreeData[]> {
      const Tree = await this.db.referentials.get('tree');
      if (Tree) {
        return Tree.data;
      };

      const res = await lastValueFrom(this.http.get<TreeData[]>(`${this.configurationService.apiUrl}tree/default`) );
      if (!res) {
        throw new Error(`Failed to fetch layers`);
      }

      await this.db.referentials.put({ data: res, key: 'tree' }, 'tree');
    return res;
  }
}
