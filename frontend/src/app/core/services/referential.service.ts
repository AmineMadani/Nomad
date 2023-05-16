import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PreferenceService } from './preference.service';
import { ReferentialDataService } from './dataservices/referential.dataservice';

@Injectable({
  providedIn: 'root'
})
export class ReferentialService {

  constructor(
    private preferenceService: PreferenceService,
    private referentialDataService: ReferentialDataService
  ) { }

  /**
   * Get the wanted referential from local storage.
   * If the referential is not found in local storage, get the referential from the server and store it in local storage.
   * @returns A Promise that resolves to the referential
   */
  async getReferential(referentialName: string): Promise<any[]> {
    let referential: any[] = await this.preferenceService.getPreference(referentialName);
    if(!referential) {
      referential = await firstValueFrom(this.referentialDataService.getReferential(referentialName));
      this.preferenceService.setPreference(referentialName,referential);
    }
    return referential;
  }

}
