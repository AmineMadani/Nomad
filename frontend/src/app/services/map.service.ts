import { Injectable } from '@angular/core';
import { forkJoin, from, fromEvent, Observable, of, switchMap } from 'rxjs';
import { Fill, Stroke, Style } from 'ol/style.js';
import { MapLayer } from '../models/map-layer.model';
import { AppDB, ITiles } from '../models/doxie.utils';

import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import MVT from 'ol/format/MVT.js';
import MapOpenLayer from 'ol/Map';
import Feature from 'ol/Feature';
import View from 'ol/View';
import Dexie from 'dexie';4
import * as zip from '@zip.js/zip.js';

@Injectable({
  providedIn: 'root',
})
export class MapService {

  constructor() {}

  private defaultStyle = new Style({
    stroke: new Stroke({ color: 'blue', width: 3 }),
    fill: new Fill({ color: 'rgba(255, 255, 255, 0.7)' }),
  });
  private selectStyle = new Style({
    stroke: new Stroke({ color: 'red', width: 8 }),
    fill: new Fill({ color: 'rgba(255, 255, 255, 0.7)' }),
  });

  private map: MapOpenLayer;
  private layers: Map<string, MapLayer> = new Map();

  private geoJsonAlreadyLoading = [];

  createMap(): MapOpenLayer {
    this.map = new MapOpenLayer({
      view: new View({
        center: [-1.67, 48.11],
        zoom: 16,
        maxZoom: 21,
      }),
    });
    return this.map;
  }

  hasEventLayer(layerKey: string): boolean {
    return this.layers.has(layerKey);
  }

  addEventLayer(layerKey: string): void {
    const mLayer: MapLayer = new MapLayer();
    const equipmentLayer = new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT({
          idProperty: 'iso_a3',
          featureClass: Feature,
        }),
        url: `https://next-canope-dev-tiler.hp.hp.m-ve.com/aep_${layerKey}/{z}/{x}/{y}.pbf`,
      }),
      style: (feature: any) => {
        if (mLayer.selection.has(feature)) {
          return this.selectStyle;
        }
        return this.defaultStyle;
      },
    });
    mLayer.layer = equipmentLayer;
    this.map.addLayer(mLayer.layer);

    mLayer.subscription = fromEvent(this.map, 'pointermove').subscribe(
      (event: any) => {
        mLayer.layer.getFeatures(event.pixel).then((features) => {
          if (!features.length) {
            mLayer.selection.clear();
            mLayer.layer.changed();
            return;
          }
          let feature = features[0];
          if (!feature) {
            return;
          }
          mLayer.selection.add(feature);
          mLayer.layer.changed();
        });
      }
    );
    this.layers.set(layerKey, mLayer);
  }

  addLocalEventLayer(layerKey: string): void {
    const mLayer: MapLayer = new MapLayer();
    const equipmentLayer = new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT({
          idProperty: 'iso_a3',
          featureClass: Feature,
        }),
        url: `https://next-canope-dev-tiler.hp.hp.m-ve.com/aep_${layerKey}/{z}/{x}/{y}.pbf`,
        tileLoadFunction: this.nextCanopeCanaLayerLoadFunction,
      }),
      style: (feature: any) => {
        if (mLayer.selection.has(feature)) {
          return this.selectStyle;
        }
        return this.defaultStyle;
      },
    });
    mLayer.layer = equipmentLayer;
    this.map.addLayer(mLayer.layer);
    this.layers.set(layerKey, mLayer);
  }

  removeEventLayer(layerKey: string): void {
    const mLayer = this.layers.get(layerKey)!;
    this.map.removeLayer(mLayer.layer);
    this.layers.delete(layerKey);
  }

  buidCacheWithFile(file: File): void {
    const model = (() => {
      return {
        getEntries(
          file: File,
          options: zip.ZipReaderGetEntriesOptions | undefined
        ) {
          return new zip.ZipReader(new zip.BlobReader(file)).getEntries(
            options
          );
        },
      };
    })();

    var reader = new FileReader();
    const controller = new AbortController();
    const signal = controller.signal;
    reader.readAsBinaryString(file);
    console.log('Start zip load');
    reader.onload = async (e) => {
      let entries = await model.getEntries(file, undefined);
      const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));
      const chunkSize = 1000;
      console.log('Start indexeddb load');
      this.loadPart(entries, 0, 0, chunkSize, signal);
    };
  }

  private loadPart(
    entries: zip.Entry[],
    startIndex: number,
    nbChunkProcess: number,
    chunkSize: number,
    signal: AbortSignal
  ) {
    let chunk = entries.slice(startIndex, startIndex + chunkSize);
    let toinsert: any[] = [];
    let parsedItems = 0;
    const db: AppDB = new AppDB();
    chunk.forEach((element) => {
      from(
        element.getData(new zip.BlobWriter(), {
          password: '',
          onprogress: (progress: number, total: number) => undefined,
          signal,
        })
      ).subscribe(async (data) => {
        parsedItems = parsedItems + 1;
        if (data.size > 0) {
          console.log('http://localhost:8100/sample/' + element.filename, data);
          toinsert.push({
            key: 'http://localhost:8100/sample/' + element.filename,
            data,
          });
        }
        if (parsedItems === chunk.length) {
          nbChunkProcess++;
          console.log('Putting in indexedDB, nb items : ' + toinsert.length);
          db.tiles
            .bulkPut(toinsert)
            .then(() => {
              let message =
                'Done putting in indexedDB, progress : ' +
                Math.round(
                  (nbChunkProcess * 100) / (entries.length / chunkSize)
                ) +
                ' %';
              console.log(message);
              if (startIndex < entries.length) {
                this.loadPart(
                  entries,
                  startIndex + chunkSize,
                  nbChunkProcess,
                  chunkSize,
                  signal
                );
              }
            })
            .catch(
              Dexie.BulkError,
              function (e: { failures: { length: string } }) {
                console.error(
                  'Error putting in indexedDB : ' +
                    e.failures.length +
                    ' items not added'
                );
              }
            );
          toinsert = [];
        }
      });
    });
  }

  private nextCanopeCanaLayerLoadFunction(tile: any, url: string): any {
    const db: AppDB = new AppDB();
    // tile.setLoader((extent: any, resolution: any, projection: any) => {
    //   db.tiles.get(url).then((res) => {
    //     if (!res) {
    //       fetch(url).then((res) => {
    //         res.blob().then((blob) => {
    //           blob.arrayBuffer().then((data) => {
    //             console.log('load from online');
    //             var format = tile.getFormat();
    //             let features = format.readFeatures(data, {
    //               extent: extent,
    //               featureProjection: projection,
    //             });
    //             tile.setFeatures(features);
    //             db.tiles.put({key: url, data: blob}, url).then(
    //               () => console.log('Saved in local')
    //             )
    //           });
    //         });
    //       });
    //     } else {
    //       res.data.arrayBuffer().then((data: any) => {
    //         console.log('load from local : ' + url);
    //         var format = tile.getFormat();
    //         let features = format.readFeatures(data, {
    //           extent: extent,
    //           featureProjection: projection,
    //         });
    //         tile.setFeatures(features);
    //       });
    //     }
    //   });
    // });

    const fetchTileFromUrl = (db: AppDB, url: string): Observable<Blob> => {
      return from(fetch(url)).pipe(
        switchMap((response: Response) => from(response.blob())),
        switchMap((blob: Blob) => forkJoin([from(db.tiles.put({key: url, data: blob})), of(blob)])),
        switchMap((result: [string, Blob]) => {
          console.log('Tile saved in DB');
          return of(result[1]);
        })
      );
    }

    tile.setLoader((extent: any, resolution: any, projection: any) => {
      from(db.tiles.get(url))
        .pipe(
          switchMap((v: ITiles | undefined) => v ? of(v.data) : fetchTileFromUrl(db, url)),
          switchMap((res: Blob) => from(res.arrayBuffer()))
        )
        .subscribe((tBuffer: ArrayBuffer) => {
          var format = tile.getFormat();
          let features = format.readFeatures(tBuffer, {
            extent: extent,
            featureProjection: projection,
          });
          tile.setFeatures(features);
        });
    });
  }
}
