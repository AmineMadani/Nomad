import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppDB, ITiles } from '../models/app-db.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor(private http: HttpClient) {
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
  public async getFeatureLayerAndId(
    featureId: string,
    layerKey: string
  ): Promise<any> {
    return await this.db.tiles
      .where('key')
      .startsWith(layerKey)
      .filter((tile) => {
        return tile.data.features?.some((feature) => feature.id === featureId);
      })
      .first((tile) =>
        tile.data.features.find((feature) => feature.id === featureId)
      );
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
    await this.getFeatureLayerAndId(featureId, layerKey).then(
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
  public async getWtrByLyrTables(lyrs: string[]): Promise<any[]> {
    const wtrEntries = await this.db.referentials
      .where('key')
      .equals('v_layer_wtr')
      .toArray();

    const wtrs = wtrEntries.flatMap((entry) => entry.data);
    const filteredWtrs = wtrs.filter((wtr) =>
      lyrs.includes(wtr.lyr_table_name)
    );

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
}
