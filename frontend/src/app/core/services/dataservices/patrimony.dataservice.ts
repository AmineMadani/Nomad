import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';
import { environment } from 'src/environments/environment';
import { AppDB, ITiles } from '../../models/app-db.model';

@Injectable({
  providedIn: 'root',
})
export class PatrimonyDataService {
  private db: AppDB;
  constructor(private http: HttpClient) {
    this.db = new AppDB();
  }

  /**
   * It fetches the index of a layer from indexed db if present or server
   * If successful, it stores the layer in IndexedDB.
   * @param {string} layerKey - string - key of the equipment
   * @returns The geojson of the index of the layer.
   */
  public async getLayerIndex(layerKey: string): Promise<any> {
    const index = await this.db.indexes.get(layerKey);
    if (index) {
      return index.data;
    }
    /* Transform http observable to promise to simplify layer's loader. It should be avoided for basic requests */
    const req = await lastValueFrom(
      this.http.get<string>(`${environment.apiUrl}patrimony/${layerKey}`)
    );
    if (!req) {
      throw new Error(`Failed to fetch index for ${layerKey}`);
    }
    await this.db.indexes.put({ data: req, key: layerKey }, layerKey);
    return req;
  }

  /**
   * It fetches the tile of a layer from indexed db if present or server
   * If successful, it stores the layer's file in IndexedDB.
   * @param {string} layerKey - string - key of the equipment
   * @param {string} file - string - the file where the view is
   * @returns The geojson file for the current tile
   */
  public async getLayerFile(layerKey: string, file: string): Promise<any> {
    const tile = await this.db.tiles.get(file);
    if (tile) {
      return tile.data;
    }
    /* It's getting the number from the file name. */
    const featureNumber: number = +file.match(
      new RegExp(`${layerKey}_(\\d+)\\.geojson`)
    )![1];
    /* Transform http observable to promise to simplify layer's loader. It should be avoided for basic requests */
    const req = await lastValueFrom(
      this.http.get<string>(
        `${environment.apiUrl}patrimony/${layerKey}/${featureNumber}`
      )
    );
    if (!req) {
      throw new Error(`Failed to fetch index for ${layerKey}`);
    }
    await this.db.tiles.put({ data: req, key: file }, file);
    return req;
  }

    public getLayerStyle(layerKey: string): Observable<any> {
      return this.http.get('./assets/sample/canalisation_style.json');
    }
}
