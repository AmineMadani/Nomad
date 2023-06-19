import { Injectable } from '@angular/core';
import { LayerReferencesDataService } from './dataservices/layer-reference.dataservice';

@Injectable({
  providedIn: 'root'
})
export class InitService {

  constructor(
    private layerReferenceDataService: LayerReferencesDataService
  ) { }

  /**
 * Retrieves initial data for a user.
 * @param userId The ID of the user to retrieve initial data for.
 * @returns A promise that resolves to a boolean indicating if the operation completed successfully.
 */
  async getInitData(): Promise<boolean> {
    let isComplete = true;

    try {
      // Try to get the user's layer references data
      await this.layerReferenceDataService.getUserLayerReferences();
    } catch (e) {
      // If an error occurs, set isComplete to false
      isComplete = false;
    }

    return isComplete;
  }
}
