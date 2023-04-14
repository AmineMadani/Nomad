import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { LayerReferencesDataService } from './dataservices/layer-reference.dataservice';
import { UserReference, ReferenceDisplayType } from '../models/layer-references.model';

@Injectable({
  providedIn: 'root'
})
export class LayerReferencesService {

  constructor(
    private layerReferencesDataService: LayerReferencesDataService,
    private userService: UserService,
  ) { }

  async getUserReferences(layerKey: string): Promise<UserReference[]> {
    let layerReferences: UserReference[] = [];

    const currentUser = await this.userService.getUser();
    if (currentUser) {
      const listLayerReferences = await this.layerReferencesDataService.getUserLayerReferences(currentUser.id);
      if (listLayerReferences) {
        const layer = listLayerReferences.find((layer) => layer.layerKey === layerKey);
        if (layer) {
          layerReferences = layer.references;
        }
      }
    }

    return layerReferences;
  }

  async getSyntheticUserReferenceKeys(layerKey: string): Promise<string[]> {
    const userLayerReferences: UserReference[] = await this.getUserReferences(layerKey);
    return userLayerReferences.filter((ref) => ref.displayType === ReferenceDisplayType.SYNTHETIC).map((ref) => ref.referenceKey);;
  }
}
