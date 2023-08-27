import { Injectable } from '@angular/core';
import { UserReference, ReferenceDisplayType, Layer, LayerStyleSummary, LayerStyleDetail, SaveLayerStylePayload, LayerReferences } from '../models/layer.model';
import { LayerDataService } from './dataservices/layer.dataservice';
import { GeoJSONObject, NomadGeoJson } from '../models/geojson.model';
import { AppDB, layerReferencesKey } from '../models/app-db.model';
import { Observable, catchError, firstValueFrom, lastValueFrom, map, tap, timeout } from 'rxjs';
import { CacheService } from './cache.service';
import { ApiSuccessResponse } from '../models/api-response.model';
import { ConfigurationService } from './configuration.service';
import { UtilsService } from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class LayerService {

  constructor(
    private layerDataService: LayerDataService,
    private cacheService: CacheService,
    private configurationService: ConfigurationService,
    private utilsService: UtilsService
  ) {
    this.db = new AppDB();
  }

  private db: AppDB;

  private listIndexOnLoad: Map<string, string> = new Map<string, string>();
  private listTileOnLoad: Map<string, string> = new Map<string, string>();

  /**
   * Get the list of user references for a given layer key.
   * @param layerKey The layer key to get the references for.
   * @returns A Promise that resolves to an array of UserReference objects.
   */
  async getUserReferences(layerKey: string): Promise<UserReference[]> {
    let layerReferences: UserReference[] = [];
    const listLayerReferences = await firstValueFrom(this.layerDataService.getUserLayerReferences());
    if (listLayerReferences) {
      const layer = listLayerReferences.find((layer) => layer.layerKey === layerKey);
      if (layer) {
        layerReferences = layer.references;
      }
    }
    return layerReferences;
  }

  /**
   * Get the list of synthetic reference keys for a given layer key.
   * @param layerKey The layer key to get the synthetic reference keys for.
   * @returns A Promise that resolves to an array of string reference keys.
   */
  async getSyntheticUserReferenceKeys(layerKey: string): Promise<string[]> {
    const userLayerReferences: UserReference[] = await this.getUserReferences(layerKey);
    return userLayerReferences.filter((ref) => ref.displayType === ReferenceDisplayType.SYNTHETIC).map((ref) => ref.referenceKey);;
  }

  /**
   * It fetches the index of a layer from indexed db if present or server
   * If successful, it stores the layer in IndexedDB.
   * @param {string} layerKey - string - key of the layer
   * @returns The geojson of the index of the layer.
   */
  public async getLayerIndex(layerKey: string): Promise<GeoJSONObject> {
    const index = await this.db.indexes.get(layerKey);
    if (index) {
      return index.data;
    }
    if (!this.listIndexOnLoad.has(layerKey)) {
      this.listIndexOnLoad.set(
        layerKey,
        'Chargement des indexes de la couche ' + layerKey
      );
      /* Transform http observable to promise to simplify layer's loader. It should be avoided for basic requests */
      const req = await firstValueFrom(this.layerDataService.getLayerIndex(layerKey));
      if (!req) {
        throw new Error(`Failed to fetch index for ${layerKey}`);
      }
      await this.db.indexes.put({ data: req, key: layerKey }, layerKey);
      this.listIndexOnLoad.delete(layerKey);
      return req;
    }
    return {};
  }

  /**
   * Fetches the tile of a layer from server.
   * If successful, stores the layer's file in IndexedDB.
   * If the network duration is superior to 2 seconds, it returns the indexedDB data.
   * @param {string} layerKey - Key of the layer.
   * @param {string} file - The file where the view is.
   * @returns The GeoJSON file for the current tile.
   */
  public async getLayerFile(
    layerKey: string,
    file: string
  ): Promise<NomadGeoJson> {
    this.listTileOnLoad.set(layerKey, 'Chargement de la couche ' + layerKey);
    /* It's getting the number from the file name. */
    const featureNumber: number = +file.match(
      new RegExp(`${layerKey}_(\\d+)\\.geojson`)
    )![1];
    /* Transform http observable to promise to simplify layer's loader. It should be avoided for basic requests */
    const req: NomadGeoJson = await lastValueFrom(
      this.layerDataService.getLayerFile(layerKey, featureNumber)
        .pipe(
          timeout(5000),
          catchError(async () => {
            const tile = await this.db.tiles.get(file);
            if (tile) {
              return tile.data;
            }
            return null;
          })
        )
    );
    if (!req) {
      this.listTileOnLoad.delete(layerKey);
      throw new Error(`Failed to fetch tile ${featureNumber} for ${layerKey}`);
    }

    await this.db.tiles.put({ data: req, key: file }, file);

    this.listTileOnLoad.delete(layerKey);
    return req;
  }

  /**
   * Method to know if layer data is currently loading from the server
   * @returns true is data is currently loading
   */
  public isDataLoading(): boolean {
    return this.listTileOnLoad.size > 0 || this.listIndexOnLoad.size > 0;
  }

  /**
   * Method to get the list of layer currently loading from server (index or tile)
   * @returns The list of layer currently loading
   */
  public getListLoadingData(): string[] {
    return [
      ...Array.from(this.listIndexOnLoad.values()),
      ...Array.from(this.listTileOnLoad.values()),
    ];
  }

  /**
   * Method to get the configuration all available layers including styles
   * @returns all available layers
   */
  public async getLayers(): Promise<Layer[]> {
    const layers = await this.db.referentials.get('layers');
    if (layers) {
      return layers.data;
    }

    const res = await lastValueFrom(
      this.layerDataService.getLayers()
    );
    if (!res) {
      throw new Error(`Failed to fetch layers`);
    }

    await this.db.referentials.put({ data: res, key: 'layers' }, 'layers');

    return res;
  }

  public getEquipmentByLayerAndId(layer: string, id: string): Promise<any> {
    return firstValueFrom(
      this.layerDataService.getEquipmentByLayerAndId(layer, id)
        .pipe(
          map((equipment: any[]) => equipment[0]),
          timeout(this.configurationService.offlineTimeout),
          catchError(async () => {
            const feature = await this.cacheService.getFeatureByLayerAndFeatureId(
              layer,
              id
            );
            return { id: feature.id, ...feature.properties };
          })
        )
    );
  }

  public getEquipmentsByLayersAndIds(idsLayers: any): Observable<any> {
    return this.layerDataService.getEquipmentsByLayersAndIds(idsLayers);
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getAllLayerStyles(): Observable<LayerStyleSummary[]> {
    return this.layerDataService.getAllLayerStyles();
  }

  /**
  * Get all layer styles.
  * @returns A promise that resolves to the list of layer styles.
  */
  public getLayerStyleById(layerStyleId: number): Observable<LayerStyleDetail> {
    return this.layerDataService.getLayerStyleById(layerStyleId);
  }

  /**
   * Create a layer style.
   */
  public createLayerStyle(layerStyle: SaveLayerStylePayload, lyrId: number): Observable<ApiSuccessResponse> {
    return this.layerDataService.createLayerStyle(layerStyle, lyrId).pipe(
      tap((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
      })
    );
  }

  /**
   * Update a layer style.
   */
  public updateLayerStyle(layerStyle: SaveLayerStylePayload, lseId: number): Observable<ApiSuccessResponse> {
    return this.layerDataService.updateLayerStyle(layerStyle, lseId).pipe(
      tap((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
      })
    );
  }

  /**
   * Delete a layer style.
   */
  public deleteLayerStyle(lseIds: number[]): Observable<ApiSuccessResponse> {
    return this.layerDataService.deleteLayerStyle(lseIds).pipe(
      tap((successResponse: ApiSuccessResponse) => {
        this.utilsService.showSuccessMessage(successResponse.message);
      })
    );
  }

  /**
 * Gets the layer references for a user, either from the IndexedDB cache or the API.
 * @param userId The ID of the user to get the layer references for.
 * @returns A promise that resolves to the layer references.
 */
  public async getUserLayerReferences(): Promise<LayerReferences[]> {
    // Fetch the layer references from API
    const layerReferencesData: LayerReferences[] = await lastValueFrom(
      this.layerDataService.getUserLayerReferences().pipe(
        timeout(2000),
        catchError(async () => {
          // Get the layer references data from IndexedDB cache
          const layerReferences = await this.db.layerReferences.get(layerReferencesKey);
          // If layer references data exists, return it
          if (layerReferences) {
            return layerReferences.data;
          }
          return null;
        })
      )
    );

    // Check if layer references data was fetched successfully
    if (!layerReferencesData) {
      throw new Error(`Failed to fetch the layer references for the current user`);
    }

    // Store layer references data in IndexedDB
    await this.db.layerReferences.put({ data: layerReferencesData, key: layerReferencesKey }, layerReferencesKey);

    // Return the layer references data fetched from the API
    return layerReferencesData;
  }

  /**
   * Save the new layer references configuration of a list of user.
   * A toast is automatically showed to the user when the api call is done.
   * @param payload: layerReferences to apply and userIds concerned.
   * @returns A response message if successfull, else return an error.
   */
  public saveLayerReferencesUser(payload: { layerReferences: UserReference[], userIds: number[] }) {
    return this.layerDataService.saveLayerReferencesUser(payload)
      .pipe(
        tap((successResponse: ApiSuccessResponse) => {
          this.utilsService.showSuccessMessage(successResponse.message);
        })
      );
  }

}
