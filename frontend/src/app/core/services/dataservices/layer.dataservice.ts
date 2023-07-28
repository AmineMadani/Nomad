import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { GeoJSONObject, NomadGeoJson } from '../../models/geojson.model';
import { Layer, LayerReferences, LayerStyleDetail, LayerStyleSummary, SaveLayerStylePayload, UserReference } from '../../models/layer.model';
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
   * @param {string} layerKey - string - key of the layer
   * @returns The geojson of the index of the layer.
   */
  public getLayerIndex(layerKey: string): Observable<GeoJSONObject> {
    return this.http.get<GeoJSONObject>(`${this.configurationService.apiUrl}layer/${layerKey}`);
  }

  /**
   * Fetches the tile of a layer from server.
   * @param {string} layerKey - Key of the layer.
   * @param {number} featureNumber - The file number where the view is.
   * @returns The GeoJSON file for the current tile.
   */
  public getLayerFile(layerKey: string, featureNumber: number): Observable<NomadGeoJson> {
    return this.http.get<NomadGeoJson>(`${this.configurationService.apiUrl}layer/${layerKey}/${featureNumber}`);
  }

  /**
   * Method to get the configuration all available layers including styles
   * @returns all available layers
   */
  public getLayers(): Observable<Layer[]> {
    return this.http.get<Layer[]>(`${this.configurationService.apiUrl}layer/default/definitions`);
  }

  /**
   * Method to get an equipment from a layer
   * @param layer the layer
   * @param id the id
   * @returns the equipment
   */
  public getEquipmentByLayerAndId(layer: string, id: string): Observable<any> {
    return this.http.get<any>(`${this.configurationService.apiUrl}layer/` + layer + `/equipment/` + id)
  }

  public getEquipmentsByLayersAndIds(idsLayers: any): Observable<any> {
    return this.http.post(`${this.configurationService.apiUrl}layer/equipment`,idsLayers);
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getAllLayerStyles(): Observable<LayerStyleSummary[]> {
    return this.http.get<LayerStyleSummary[]>(`${this.configurationService.apiUrl}layer/styles`);
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getLayerStyleById(layerStyleId: number): Observable<LayerStyleDetail> {
    return this.http.get<LayerStyleDetail>(`${this.configurationService.apiUrl}layer/styles/${layerStyleId}`);
  }

  /**
   * Create a layer style.
   */
  public createLayerStyle(layerStyle: SaveLayerStylePayload, lyrId: number): Observable<any> {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}layer/${lyrId}/styles`, layerStyle);
  }

  /**
   * Update a layer style.
   */
  public updateLayerStyle(layerStyle: SaveLayerStylePayload, lseId: number): Observable<any> {
    return this.http.put<ApiSuccessResponse>(`${this.configurationService.apiUrl}layer/styles/${lseId}`, layerStyle);
  }

  /**
   * Delete a layer style.
   */
  public deleteLayerStyle(lseId: number): Observable<any> {
    return this.http.delete<ApiSuccessResponse>(`${this.configurationService.apiUrl}layer/styles/${lseId}`);
  }

  /**
 * Gets the layer references for a user, either from the IndexedDB cache or the API.
 * @param userId The ID of the user to get the layer references for.
 * @returns A promise that resolves to the layer references.
 */
  public getUserLayerReferences(): Observable<LayerReferences[]> {
    return this.http.get<LayerReferences[]>(`${this.configurationService.apiUrl}layer/references/user`);
  }

  /**
   * Save the new layer references configuration of a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: layerReferences to apply and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public saveLayerReferencesUser(payload: { layerReferences: UserReference[], userIds: number[] }):Observable<any> {
    return this.http.post<ApiSuccessResponse>(`${this.configurationService.apiUrl}layer/references/user`, payload);
  }
}
