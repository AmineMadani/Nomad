import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, switchMap, forkJoin, of, map, finalize } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppDB, ITiles } from '../models/app-db.model';
import JSZip, { JSZipObject } from 'jszip';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  constructor(private http: HttpClient) {}

  private cacheLoaded$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public onCacheLoaded(): Observable<boolean> {
    return this.cacheLoaded$.asObservable();
  }

  public setCacheLoaded(loaded: boolean): void {
    this.cacheLoaded$.next(loaded);
  }

  public async cacheIsAlreadySet(): Promise<boolean> {
    const db: AppDB = new AppDB();
    const tiles: ITiles[] = await db.tiles.filter((tile: ITiles) => /index/.test(tile.key)).toArray();
    return tiles.length > 0;
  }

  public loadZips(): Observable<void> {
    const db: AppDB = new AppDB();
    return this.loadZip('/assets/sample/geojson-index-3857.zip', 'index_3857').pipe(
      switchMap((indexTiles: ITiles[]) => forkJoin([of(indexTiles), this.loadZip('/assets/sample/geojson-data-3857.zip', 'data_3857')])),
      map((tiles: [ITiles[], ITiles[]]) => [...tiles[0], ...tiles[1]]),
      switchMap(async (tiles: ITiles[]) => {
        await Promise.all(await db.tiles.bulkPut(tiles));
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
