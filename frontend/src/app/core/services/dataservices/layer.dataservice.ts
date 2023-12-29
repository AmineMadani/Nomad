import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { GeoJSONObject, NomadGeoJson } from '../../models/geojson.model';
import { Layer, LayerReferences, LayerStyleDetail, LayerStyleSummary, SaveLayerStylePayload, SearchEquipments, UserReference, VLayerWtr } from '../../models/layer.model';
import { ApiSuccessResponse } from '../../models/api-response.model';
import { LayerGrpAction } from '../../models/layer-gp-action.model';

@Injectable({
  providedIn: 'root',
})
export class LayerDataService {

  constructor(
    private http: HttpClient,
    private configurationService: ConfigurationService,
  ) {
  }

  /**
   * It fetches the index of a layer from server
   * @returns The geojson of the index of the layer.
   */
  public getLayerIndexes(): Promise<GeoJSONObject> {
    return firstValueFrom(
      this.http.get<GeoJSONObject>(`${this.configurationService.apiUrl}layers/indexes`)
    );
  }

  /**
   * Fetches the tile of a layer from server.
   * @param {string} layerKey - Key of the layer.
   * @param {number} featureNumber - The file number where the view is.
   * @returns The GeoJSON file for the current tile.
   */
  public getLayerFile(layerKey: string, featureNumber: number, params: any): Promise<NomadGeoJson> {
    return firstValueFrom(
      this.http.post<NomadGeoJson>(`${this.configurationService.apiUrl}layers/${layerKey}/${featureNumber}`, params)
    );
  }

  /**
   * Method to get the configuration all available layers including styles
   * @returns all available layers
   */
  public getAllLayers(): Promise<Layer[]> {
    return firstValueFrom(
      this.http.get<Layer[]>(`${this.configurationService.apiUrl}layers/defaults/definitions`)
    );
  }

  /**
   * Method to get an equipment from a layer
   * @param layer the layer
   * @param id the id
   * @returns the equipment
   */
  public getEquipmentByLayerAndId(layer: string, id: string): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(`${this.configurationService.apiUrl}layers/` + layer + `/equipments/` + id)
    );
  }

  public getEquipmentsByLayersAndIds(idsLayers: any): Promise<any> {
    return firstValueFrom(
      this.http.post(`${this.configurationService.apiUrl}layers/equipments`, idsLayers)
    );
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getAllLayerStyles(): Promise<LayerStyleSummary[]> {
    return firstValueFrom(
      this.http.get<LayerStyleSummary[]>(`${this.configurationService.apiUrl}layers/styles`)
    );
  }

  /**
  * Get a layer style by id.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getLayerStyleById(layerStyleId: number): Promise<LayerStyleDetail> {
    return firstValueFrom(
      this.http.get<LayerStyleDetail>(`${this.configurationService.apiUrl}layers/styles/${layerStyleId}`)
    );
  }

  /**
   * Create a layer style.
   */
  public createLayerStyle(layerStyle: SaveLayerStylePayload, lyrId: number): Promise<ApiSuccessResponse> {
    return firstValueFrom(
      this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}layers/${lyrId}/styles/create`, layerStyle)
    );
  }

  /**
   * Update a layer style.
   */
  public updateLayerStyle(layerStyle: SaveLayerStylePayload, lseId: number): Promise<ApiSuccessResponse> {
    return firstValueFrom(
      this.http.put<ApiSuccessResponse>(`${this.configurationService.apiUrl}layers/styles/${lseId}/update`, layerStyle)
    );
  }

  /**
   * Delete a layer style.
   */
  public deleteLayerStyle(lseIds: number[]): Promise<ApiSuccessResponse> {
    return firstValueFrom(
      this.http.delete<ApiSuccessResponse>(`${this.configurationService.apiUrl}layers/styles/delete?lseIds=${lseIds}`)
    );
  }

  /**
 * Gets the layer references for a user, either from the IndexedDB cache or the API.
 * @param userId The ID of the user to get the layer references for.
 * @returns A promise that resolves to the layer references.
 */
  public getUserLayerReferences(): Promise<LayerReferences[]> {
    return firstValueFrom(
      this.http.get<LayerReferences[]>(`${this.configurationService.apiUrl}layers/references/users`)
    );
  }

  /**
   * Save the new layer references configuration of a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: layerReferences to apply and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public saveLayerReferencesUser(payload: { layerReferences: UserReference[], userIds: number[] }): Promise<any> {
    return firstValueFrom(
      this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}layers/references/users/save`, payload)
    );
  }

  /**
    * Get all VLayerWtr.
    * @returns A promise that resolves to the list of VLayerWtr.
    */
  public getAllVLayerWtr(): Promise<VLayerWtr[]> {
    return firstValueFrom(
      this.http.get<VLayerWtr[]>(`${this.configurationService.apiUrl}layers/v-layer-wtr`)
    );
  }

  public getAssetByPartialId(partialId: string): Observable<string[]>{
    return this.http.get<string[]>(`${this.configurationService.apiUrl}layers/search/${partialId}`);
  }

  /**
  * Get all VLayerWtr.
  * @returns A promise that resolves to the list of VLayerWtr.
  */
  public getAllLayerGrpActions(): Promise<LayerGrpAction[]> {
    return firstValueFrom(
      this.http.get<LayerGrpAction[]>(`${this.configurationService.apiUrl}layers/groups`)
    );
  }

  public getAssetIdsByLayersAndFilterIds(
    listLayerKey: string[],
    listFilterId: number[],
    filterType: string
  ): Promise<SearchEquipments[]> {
    let params = new HttpParams();
    params = params.append('layerKeys', listLayerKey.join(','));
    params = params.append('filterIds', listFilterId.join(','));
    params = params.append('filterType', filterType.toString());

    return firstValueFrom(
      this.http.get<SearchEquipments[]>(`${this.configurationService.apiUrl}layers/asset-ids/by-filters`, { params })
    );
  }
}
