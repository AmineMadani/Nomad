import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppDB, ITiles } from '../models/app-db.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { finalize } from 'rxjs/internal/operators/finalize';
import { forkJoin } from 'rxjs/internal/observable/forkJoin';
import { Observable } from 'rxjs/internal/Observable';
import { from } from 'rxjs/internal/observable/from';
import { map } from 'rxjs/internal/operators/map';
import { of } from 'rxjs/internal/observable/of';
import JSZip, { JSZipObject } from 'jszip';

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
    const tiles: ITiles[] = await this.db.tiles.filter((tile: ITiles) => /index/.test(tile.key)).toArray();
    return tiles.length > 0;
  }

  public loadZips(): Observable<void> {
    return this.loadZip('/assets/sample/geojson-index-3857.zip', 'index_3857').pipe(
      switchMap((indexTiles: ITiles[]) => forkJoin([of(indexTiles), this.loadZip('/assets/sample/geojson-data-3857.zip', 'data_3857')])),
      map((tiles: [ITiles[], ITiles[]]) => [...tiles[0], ...tiles[1]]),
      switchMap(async (tiles: ITiles[]) => {
        await Promise.all(await this.db.tiles.bulkPut(tiles));
      }),
      finalize(() => console.log('storage loaded'))
    );
  }

  private loadZip(zipPath: string, folderName: string): Observable<ITiles[]> {
    const zip: JSZip = new JSZip();
    return this.http
      .get(zipPath, { responseType: 'blob' })
      .pipe(
        switchMap((zipBlob: Blob) => from(zip.loadAsync(zipBlob))),
        switchMap(async (zBlob: JSZip) => {
          const files = zBlob.folder(folderName)?.filter((path: string, file: JSZipObject) => !file.dir)!;
          return await Promise.all(files.map(async (f: JSZipObject) => { 
            return { key: f.name, data: await f.async('text') as any} as ITiles
          }));
        }),
        finalize(() => console.log('finalize : ' + folderName))
      )
  }
}
