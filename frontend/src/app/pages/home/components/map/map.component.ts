import { Component, OnInit } from '@angular/core';
import MapOpenLayer from 'ol/Map';
import View from 'ol/View';
import { OSM, WMTS } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { get as getProjection } from 'ol/proj.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import { getWidth } from 'ol/extent.js';
import { getUid } from 'ol/util';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {

  constructor() { }

  projection = getProjection('EPSG:3857');

  mapLayers: any[] = [];

  idLayers:Map<string,string> = new Map<string,string>();

  public map!: MapOpenLayer;

  ngOnInit() {
    this.projection = getProjection('EPSG:3857');
    if (this.projection != null) {
      this.generateMap();
      this.map = new MapOpenLayer({
        layers: this.mapLayers,
        target: 'map',
        view: new View({
          center: [260516, 6246918],
          zoom: 16, maxZoom: 21
        }),
      });
    }
  }

  generateMap() {
    if (this.projection != null) {
      let projectionExtent = this.projection.getExtent();
      let resolutions = new Array(21);
      let matrixIds = new Array(21);
      let size = getWidth(projectionExtent) / 256;
      for (let z = 0; z < 21; ++z) {
        resolutions[z] = size / Math.pow(2, z);
        matrixIds[z] = z;
      }
      let parcelLayer = new TileLayer({
        preload: Infinity,
        source: new WMTS({
          attributions: ["IGN-F/Géoportail"],
          url: 'https://wxs.ign.fr/parcellaire/geoportail/wmts',
          layer: 'CADASTRALPARCELS.PARCELS',
          matrixSet: 'PM',
          format: 'image/png',
          projection: this.projection,
          tileGrid: new WMTSTileGrid({
            origin: [-20037508, 20037508],
            resolutions: resolutions,
            matrixIds: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"],
          }),
          style: 'normal',
          wrapX: true,
        }),
      });
      this.idLayers.set('parcelLayer',getUid(parcelLayer));

      let satelliteLayer = new TileLayer({
        preload: Infinity,
        visible: false,
        source: new WMTS({
          attributions: ["IGN-F/Géoportail"],
          url: 'https://wxs.ign.fr/essentiels/geoportail/wmts',
          layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
          matrixSet: 'PM',
          format: 'image/jpeg',
          projection: this.projection,
          tileGrid: new WMTSTileGrid({
            origin: [-20037508, 20037508],
            resolutions: resolutions,
            matrixIds: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"],
          }),
          style: 'normal',
          wrapX: true,
        }),
      });
      this.idLayers.set('satelliteLayer',getUid(satelliteLayer));

      let topoLayer = new TileLayer({
        preload: Infinity,
        visible: false,
        source: new WMTS({
          attributions: ["IGN-F/Géoportail"],
          url: 'https://wxs.ign.fr/essentiels/geoportail/wmts',
          layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
          matrixSet: 'PM',
          format: 'image/png',
          projection: this.projection,
          tileGrid: new WMTSTileGrid({
            origin: [-20037508, 20037508],
            resolutions: resolutions,
            matrixIds: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21"],
          }),
          style: 'normal',
          wrapX: true,
        }),
      });
      this.idLayers.set('topoLayer',getUid(topoLayer));

      let osmLayer = new TileLayer({
        preload: Infinity,
        visible: false,
        source: new OSM(),
      });
      this.idLayers.set('osmLayer',getUid(osmLayer));

      this.mapLayers.push(parcelLayer);
      this.mapLayers.push(osmLayer);
      this.mapLayers.push(satelliteLayer);
      this.mapLayers.push(topoLayer);
    }
  }

  displayLayer(keyLayer:string) {
    this.map.getLayers().getArray().forEach( layer => {
      if(getUid(layer) == this.idLayers.get(keyLayer)){
        layer.setVisible(true);
      } else {
        layer.setVisible(false);
      }
    });
  }

}
