import { Injectable } from '@angular/core';
import { AppDB, ITiles } from '../models/app-db.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { VLayerWtr } from '../models/layer.model';
import { from, of, switchMap, tap } from 'rxjs';

export enum ReferentialCacheKey {
  CITIES = 'cities',
  CONTRACTS = 'contracts',
  LAYERS = 'layers',
  V_LAYER_WTR = 'v_layer_wtr',
  LAYER_INDEX = 'layer_index',
  WORKORDER_TASK_STATUS = 'workorder_task_status',
  WORKORDER_TASK_REASON = 'workorder_task_reason',
  PERMISSIONS = 'permissions',
  FORM_TEMPLATE = 'form_template',
  LAYER_REFERENCES = 'layer_references'
}
@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor() {
    this.db = new AppDB();
  }

  private db: AppDB;
  private cacheLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public onCacheLoaded(): Observable<boolean> {
    return this.cacheLoaded$.asObservable();
  }

  public setCacheLoaded(loaded: boolean): void {
    this.cacheLoaded$.next(loaded);
  }

  public async cacheIsAlreadySet(): Promise<boolean> {
    const tiles: ITiles[] = await this.db.tiles
      .filter((tile: ITiles) => /index/.test(tile.key))
      .toArray();
    return tiles.length > 0;
  }

  public async getObjectFromCache(table: string, key: string): Promise<any> {
    return await this.db.table(table).where('key').equals(key).first();
  }

  /**
   * Returne all the data for a feature in a layer
   * @param featureId featureId the id aog the future, ex: IDF-000070151
   * @param layerKey the key of the layer containing the feature, ex:aep_canalisation
   * @returns
   */
  public async getFeatureByLayerAndFeatureId(
    layerKey: string,
    featureId: string
  ): Promise<any> {
    return await this.db.tiles
      .where('key')
      .startsWith(layerKey)
      .filter((tile) => {
        return tile?.data?.features?.some(
          (feature) => feature.id.toString() === featureId
        );
      })
      .first((tile) => {
        return tile?.data?.features?.find(
          (feature) => feature.id.toString() === featureId
        );
      });
  }

  /**
   * Return all the feature from a specific layer which have the wanted property
   * @param layerKey the key of the layer containing the feature, ex:aep_canalisation
   * @param property the property use has a key to search
   * @param value  the value to search
   * @returns List of match feature
   */
  public async getFeatureByLayerAndProperty(
    layerKey: string,
    property: string,
    value: string
  ): Promise<any> {
    return await this.db.tiles
      .where('key')
      .startsWith(layerKey)
      .filter((tile) => {
        return tile.data.features?.some(
          (feature) => feature.properties[property].toString() === value
        );
      })
      .toArray()
      .then((tiles) => {
        let result: any[] = [];
        if (tiles.length > 0) {
          for (let tile of tiles) {
            result = [
              ...result,
              ...tile.data.features?.filter(
                (feature) => feature.properties[property].toString() === value
              ),
            ];
          }
        }
        return result;
      });
  }

  public async getFeaturesByLayersAndIds(
    layerKeys: string[],
    ids: string[]
  ): Promise<any> {
    const tiles = await this.db.tiles
      .filter((tile) => layerKeys.some((prefix) => tile.key.startsWith(prefix)))
      .toArray();

    const features = tiles.flatMap((tile) =>
      tile.data.features
        .filter((feature) => ids.includes(feature.id))
        .map((feature) => feature.properties)
    );

    return features;
  }

  /**
   * Returne all the tile where a specific feature is located in a layer
   * @param featureId featureId the id aog the future, ex: IDF-000070151
   * @param layerKey the key of the layer containing the feature, ex:aep_canalisation
   * @returns
   */
  private async getTileByLayerAndId(
    featureId: string,
    layerKey: string
  ): Promise<any> {
    return await this.db.tiles
      .where('key')
      .startsWith(layerKey)
      .filter((tile) => {
        return tile.data.features?.some((feature) => feature.id === featureId);
      })
      .first();
  }

  /**
   * Update the feature geometry in cache
   * @param featureId featureId the id aog the future, ex: IDF-000070151
   * @param layerKey the key of the layer containing the feature, ex:aep_canalisation
   */
  public updateCacheFeatureGeometry(
    featureId: string,
    layerKey: string,
    newGeometry: number[]
  ) {
    this.getTileByLayerAndId(featureId, layerKey).then((res) => {
      for (let data of res.data.features) {
        if (data.id.toString() == featureId) {
          data.geometry.coordinates = newGeometry;
          break;
        }
      }
      this.db.tiles
        .where('key')
        .startsWith(layerKey)
        .filter((tile) => {
          return tile.data.features?.some(
            (feature) => feature.id === featureId
          );
        })
        .modify(res);
    });
  }

  /**
   * Returne all the geometry for a feature in a layer
   * @param featureId featureId featureId the id aog the future, ex: IDF-000070151
   * @param layerKey the key of the layer containing the feature, ex:aep_canalisation
   * @returns the geometry, Array<number>
   */
  public async getGeometryByLayerAndId(
    featureId: string,
    layerKey: string
  ): Promise<any> {
    let geom;
    await this.getFeatureByLayerAndFeatureId(layerKey, featureId).then(
      (result) => (geom = result.geometry.coordinates)
    );
    return geom;
  }

  /**
   * Retrieves reason entries based on a list of layer names.
   * @param {string[]} lyrs - The `lyrs` parameter is an array of strings that represents the layer table
   * names.
   * @returns The function `getWtrByLyrTables` returns an array of objects that match the filter
   * condition.
   */
  public async getWtrByLyrTables(lyrs: string[]): Promise<VLayerWtr[]> {
    const wtrEntries = await this.db.referentials
      .where('key')
      .equals(ReferentialCacheKey.V_LAYER_WTR)
      .distinct()
      .toArray();

    const wtrs: VLayerWtr[] = wtrEntries.flatMap((entry) => entry.data);
    const filteredWtrs = wtrs.filter((wtr) => lyrs.includes(wtr.lyrTableName));

    return filteredWtrs;
  }

  /**
   * Saves an object to a database table, either by updating an existing object
   * or creating a new one.
   * @param {string} table - The name of the table in the database.
   * @param {string} id - Unique identifier.
   * @param {any} object - Data object to save in the database.
   */
  public async saveObject(
    table: string,
    id: string,
    object: any
  ): Promise<void> {
    const obj = await this.getObjectFromCache(table, id);
    if (obj) {
      await this.db.table(table).update(id, { data: object });
    } else {
      await this.db.table(table).put({ data: object, key: id }, id);
    }
  }

  public async deleteObject(table: string, id: string): Promise<void> {
    await this.db.table(table).delete(id);
  }

  /**
   * Fetches referential data either from a local cache or from a service call.
   * If the data is not available in the cache, it will be fetched using the provided service call
   * and then saved to the cache for future access.
   *
   * @param referentialCacheKey - The key used to store and retrieve the data from the local cache.
   * @param serviceCall - A function that returns an Observable which fetches the data when the cache is empty.
   * @returns An Observable of the fetched data, either from the local cache or from the service call.
   */
  public fetchReferentialsData<T>(
    referentialCacheKey: ReferentialCacheKey,
    serviceCall: () => Observable<T>,
    forceGetFromDb: boolean = false
  ): Observable<T> {
    if (forceGetFromDb) {
      return serviceCall().pipe(
        tap(async (data) => {
          await this.db.referentials.put(
            { data: data, key: referentialCacheKey },
            referentialCacheKey
          );
        })
      );
    } else {
      return from(this.db.referentials.get(referentialCacheKey)).pipe(
        switchMap((referential) => {
          if (referential?.data) {
            return of(referential.data);
          } else {
            return serviceCall().pipe(
              tap(async (data) => {
                await this.db.referentials.put(
                  { data: data, key: referentialCacheKey },
                  referentialCacheKey
                );
              })
            );
          }
        })
      );
    }
  }

  public clearCache() {
    this.db.referentials.clear();
    this.db.tiles.clear();
  }

  /**
  * Fetches referential data either from a local cache or from a service call.
  * If the data is not available in the cache, it will be fetched using the provided service call
  * and then saved to the cache for future access.
  *
  * @param referentialCacheKey - The key used to store and retrieve the data from the local cache.
  * @param serviceCall - A function that returns an Observable which fetches the data when the cache is empty.
  * @returns An Observable of the fetched data, either from the local cache or from the service call.
  */
  public fetchTilesData<T>(referentialCacheKey: ReferentialCacheKey, serviceCall: () => Observable<T>): Observable<T> {
    return from(this.db.referentials.get(referentialCacheKey)).pipe(
      switchMap(referential => {
        if (referential?.data) {
          return of(referential.data);
        } else {
          return serviceCall().pipe(
            tap(async data => {
              await this.db.referentials.put({ data: data, key: referentialCacheKey }, referentialCacheKey);
            })
          );
        }
      })
    );
  }
}
