import { Style } from 'ol/style.js';
import { FeatureLike } from 'ol/Feature';
import { Geometry } from 'ol/geom';
import { AppDB, ITiles } from './app-db.model';
import { Projection } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import Vector from 'ol/source/Vector';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT.js';
import * as olLoadingstrategy from 'ol/loadingstrategy';
import Cluster from 'ol/source/Cluster';
import { Subscription } from 'rxjs/internal/Subscription';
import { Layer, layers, LayerTypeEnum } from './layer.model';
import { Equipment } from './equipment.model';
import { Observable } from 'rxjs/internal/Observable';
import { from } from 'rxjs/internal/observable/from';
import { environment } from 'src/environments/environment';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { of } from 'rxjs/internal/observable/of';
import { filter } from 'rxjs';

export class MapLayer {
  constructor(layerKey: string, style: Style, selectedStyle: Style) {
    const layer: Layer = layers.find((l) => l.key === layerKey)!;

    this.hoverFeature = new Set();
    this.equipmentSelected = undefined;
    this.layer = new VectorLayer({
      source: this.buildSource(layer),
      minZoom: layer.minZoom,
      zIndex: layer.zindex,
      declutter: true,
      style: (feature: any) => {
        const properties = feature.getProperties();
        if (
          this.hoverFeature.has(feature) ||
          (properties &&
            this.equipmentSelected &&
            properties['id'] == this.equipmentSelected.id)
        ) {
          return selectedStyle;
        }
        if (style.getText() != null) {
          style.getText().setText(feature.get('features').length.toString());
        }
        return style;
      },
    });
  }

  public layer: VectorLayer<any>;
  public hoverFeature: Set<FeatureLike>;
  public equipmentSelected: Equipment | undefined;
  public subscription: Subscription;

  private buildSource(layer: Layer): Vector | Cluster {
    let source = this.createLoader(layer.key);
    switch (layer.type) {
      case LayerTypeEnum.VECTOR:
        break;
      case LayerTypeEnum.CLUSTER:
        source = new Cluster({
          distance: layer.distance,
          minDistance: layer.minDistance,
          source: source,
        });
        break;
    }
    return source;
  }

  private createLoader(layerKey: string): Vector | Cluster {
    const db: AppDB = new AppDB();
    // const indexAlreadyLoaded: any;
    const geoJsonAlreadyLoading: Map<string, any> = new Map();
    const source = new Vector({
      format: new GeoJSON(),
      strategy: olLoadingstrategy.bbox,
      loader: async (extent: number[], r: number, p: Projection, success) => {
        this.getIndex(layerKey)
          .pipe(
            switchMap((res: Response) => {
              return from(res.json());
            }),
            switchMap((index: any) => {
              console.log(index);
              let fileToLoad: string = '';
              index.features.forEach((el: any) => {
                console.log(el);
                const wkt = new WKT();
                const file: string = el.properties.file;
                let bbox = el.properties.bbox.replace('BOX', 'POLYGON');
                bbox = bbox.replace('(', '((');
                bbox = bbox.replace(')', '))');
                console.log(bbox);
                const isIn = wkt
                  .readFeature(bbox)
                  .getGeometry()
                  ?.intersectsExtent(extent);
                if (isIn && !geoJsonAlreadyLoading.has(file)) {
                  fileToLoad = file;
                }
              });
              if (fileToLoad.length > 0) {
                console.log(fileToLoad);
                return this.getFeatureFile(layerKey, fileToLoad);
              } else {
                return of(undefined);
              }
            }),
            filter((res: Response | undefined) => res !== undefined),
            switchMap((res: Response | undefined) => from(res!.json()))
          )
          .subscribe((tile: any) => {
            console.log(tile);
            const features = source
              .getFormat()!
              .readFeatures(tile.features) as Feature[];
            source.addFeatures(features);
            geoJsonAlreadyLoading.set(layerKey, tile);
            success!(features);
          });

        // const indexTile: ITiles | undefined = await db.tiles.get(
        //   `index_3857/opt_3857_${layerKey}_index.geojson`
        // );
        // if (indexTile) {
        //   JSON.parse(indexTile.data).features.forEach(async (el: any) => {
        //     const wkt = new WKT();
        //     const url: string = `data_3857/opt_3857_${layerKey}/${el.properties.file}`;
        //     const isIn = wkt
        //       .readFeature(el.properties.bbox)
        //       .getGeometry()
        //       ?.intersectsExtent(extent);
        //     if (isIn && !geoJsonAlreadyLoading.includes(url)) {
        //       const layerTile: ITiles | undefined = await db.tiles.get(url);
        //       if (layerTile) {
        //         const features = source
        //           .getFormat()!
        //           .readFeatures(JSON.parse(layerTile.data), {
        //             dataProjection: 'ESPG:2154',
        //             featureProjection: 'EPSG:3857',
        //           }) as Feature[];
        //         source.addFeatures(features);
        //         geoJsonAlreadyLoading.push(url);
        //         success!(features);
        //       }
        //     }
        //   });
        // }
      },
    });
    return source;
  }

  private getIndex(layerKey: string): Observable<Response> {
    return from(
      fetch(`${environment.apiUrl}patrimony/${layerKey}`, {
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      })
    );
  }

  private getFeatureFile(layerKey: string, file: string): Observable<Response> {
    const featureNumber: number = +file.match(new RegExp(`${layerKey}_(\\+d\\).geojson`))![1];
    return from(
      fetch(`${environment.apiUrl}patrimony/${layerKey}/${featureNumber}`, {
        mode: 'cors',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('access_token')}`,
        },
      })
    );
  }

  // private createLoader(
  //   layerKey: string
  // ): Vector | Cluster {
  //   const db: AppDB = new AppDB();
  //   const geoJsonAlreadyLoading: string[] = [];
  //   const source = new Vector({
  //     format: new GeoJSON(),
  //     strategy: olLoadingstrategy.bbox,
  //     loader: async (extent: number[], r: number, p: Projection, success) => {
  //       const indexTile: ITiles | undefined = await db.tiles.get(
  //         `index_3857/opt_3857_${layerKey}_index.geojson`
  //       );
  //       if (indexTile) {
  //         JSON.parse(indexTile.data).features.forEach(async (el: any) => {
  //           const wkt = new WKT();
  //           const url: string = `data_3857/opt_3857_${layerKey}/${el.properties.file}`;
  //           const isIn = wkt
  //             .readFeature(el.properties.bbox)
  //             .getGeometry()
  //             ?.intersectsExtent(extent);
  //           if (isIn && !geoJsonAlreadyLoading.includes(url)) {
  //             const layerTile: ITiles | undefined = await db.tiles.get(url);
  //             if (layerTile) {
  //               const features = source
  //                 .getFormat()!
  //                 .readFeatures(JSON.parse(layerTile.data), {
  //                   dataProjection: 'ESPG:2154',
  //                   featureProjection: 'EPSG:3857',
  //                 }) as Feature[];
  //               source.addFeatures(features);
  //               geoJsonAlreadyLoading.push(url);
  //               success!(features);
  //             }
  //           }
  //         });
  //       }
  //     }
  //   });
  //   return source;
  // }
}
