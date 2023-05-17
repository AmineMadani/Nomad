import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ReferentialDataService } from './dataservices/referential.dataservice';
import { AppDB } from '../models/app-db.model';

@Injectable({
  providedIn: 'root'
})
export class ReferentialService {

  private db: AppDB;

  constructor(
    private referentialDataService: ReferentialDataService
  ) { 
    this.db = new AppDB();
  }

  /**
   * Get the wanted referential from local storage.
   * If the referential is not found in local storage, get the referential from the server and store it in local storage.
   * @returns A Promise that resolves to the referential
   */
  async getReferential(referentialName: string): Promise<any[]> {
    let referential = (await this.db.referentials.get(referentialName))?.data;
    if(!referential) {
      referential = await firstValueFrom(this.referentialDataService.getReferential(referentialName));
      await this.db.referentials.put({ data: referential, key: referentialName }, referentialName);
    }
    return referential;
  }

}
