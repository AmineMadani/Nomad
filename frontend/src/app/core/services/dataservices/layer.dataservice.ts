import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { GeoJSONObject, NomadGeoJson } from '../../models/geojson.model';
import { Layer, LayerReferences, LayerStyleDetail, LayerStyleSummary, SaveLayerStylePayload, UserReference, VLayerWtr } from '../../models/layer.model';
import { ApiSuccessResponse } from '../../models/api-response.model';

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
  public getLayerIndexes(): Observable<GeoJSONObject> {
    return this.http.get<GeoJSONObject>(`${this.configurationService.apiUrl}layers/indexes`);
  }

  /**
   * Fetches the tile of a layer from server.
   * @param {string} layerKey - Key of the layer.
   * @param {number} featureNumber - The file number where the view is.
   * @returns The GeoJSON file for the current tile.
   */
  public getLayerFile(layerKey: string, featureNumber: number): Observable<NomadGeoJson> {
    return this.http.get<NomadGeoJson>(`${this.configurationService.apiUrl}layers/${layerKey}/${featureNumber}`);
  }

  /**
   * Fetches the tile of a layer from server.
   * @param {string} layerKey - Key of the layer.
   * @param {number} featureNumber - The file number where the view is.
   * @returns The GeoJSON file for the current tile.
   */
  public getListLayerFile(layerKey: string, listFeatureNumber: number[]): Observable<NomadGeoJson[]> {
    var params = new HttpParams();
    params = params.append('listTileNumber', listFeatureNumber.join(','));

    return this.http.get<NomadGeoJson[]>(`${this.configurationService.apiUrl}layers/${layerKey}`, {params});
  }

  /**
   * Method to get the configuration all available layers including styles
   * @returns all available layers
   */
  public getAllLayers(): Observable<Layer[]> {
    return this.http.get<Layer[]>(`${this.configurationService.apiUrl}layers/defaults/definitions`);
  }

  /**
   * Method to get an equipment from a layer
   * @param layer the layer
   * @param id the id
   * @returns the equipment
   */
  public getEquipmentByLayerAndId(layer: string, id: string): Observable<any> {
    return this.http.get<any>(`${this.configurationService.apiUrl}layers/` + layer + `/equipments/` + id)
  }

  public getEquipmentsByLayersAndIds(idsLayers: any): Observable<any> {
    return this.http.post(`${this.configurationService.apiUrl}layers/equipments`,idsLayers);
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getAllLayerStyles(): Observable<LayerStyleSummary[]> {
    return this.http.get<LayerStyleSummary[]>(`${this.configurationService.apiUrl}layers/styles`);
  }

  /**
  * Get a layer style by id.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getLayerStyleById(layerStyleId: number): Observable<LayerStyleDetail> {
    return this.http.get<LayerStyleDetail>(`${this.configurationService.apiUrl}layers/styles/${layerStyleId}`);
  }

  /**
   * Create a layer style.
   */
  public createLayerStyle(layerStyle: SaveLayerStylePayload, lyrId: number): Observable<ApiSuccessResponse> {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}layers/${lyrId}/styles/create`, layerStyle);
  }

  /**
   * Update a layer style.
   */
  public updateLayerStyle(layerStyle: SaveLayerStylePayload, lseId: number): Observable<ApiSuccessResponse> {
    return this.http.put<ApiSuccessResponse>(`${this.configurationService.apiUrl}layers/styles/${lseId}/update`, layerStyle);
  }

  /**
   * Delete a layer style.
   */
  public deleteLayerStyle(lseIds: number[]): Observable<ApiSuccessResponse> {
    return this.http.delete<ApiSuccessResponse>(`${this.configurationService.apiUrl}layers/styles/delete?lseIds=${lseIds}`);
  }

  /**
 * Gets the layer references for a user, either from the IndexedDB cache or the API.
 * @param userId The ID of the user to get the layer references for.
 * @returns A promise that resolves to the layer references.
 */
  public getUserLayerReferences(): Observable<LayerReferences[]> {
    return this.http.get<LayerReferences[]>(`${this.configurationService.apiUrl}layers/references/users`);
  }

  /**
   * Save the new layer references configuration of a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: layerReferences to apply and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public saveLayerReferencesUser(payload: { layerReferences: UserReference[], userIds: number[] }):Observable<any> {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}layers/references/users/save`, payload);
  }

  /**
    * Get all VLayerWtr.
    * @returns A promise that resolves to the list of VLayerWtr.
    */
  public getAllVLayerWtr(): Observable<VLayerWtr[]> {
    return this.http.get<VLayerWtr[]>(`${this.configurationService.apiUrl}layers/v-layer-wtr`);
  }
}
