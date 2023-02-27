export interface BackLayer {
  type: string;
  key: string;
  attributions?: string[];
  url?: string;
  layer?: string;
  matrixSet?: string;
  format?: string;
  origin?: number[];
  visible: boolean;
  default: boolean;
}

export const MAP_DATASET: BackLayer[] = [
  {
    type: 'WMTS',
    key: 'sattelite',
    attributions: ['IGN-F/Géoportail'],
    url: 'https://wxs.ign.fr/essentiels/geoportail/wmts',
    layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
    matrixSet: 'PM',
    format: 'image/jpeg',
    origin: [-20037508, 20037508],
    visible: true,
    default: false
  },
  {
    type: 'WMTS',
    key: 'topo',
    attributions: ['IGN-F/Géoportail'],
    url: 'https://wxs.ign.fr/essentiels/geoportail/wmts',
    layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2',
    matrixSet: 'PM',
    format: 'image/png',
    origin: [-20037508, 20037508],
    visible: true,
    default: false,
  },
  {
    type: 'WMTS',
    key: 'parcel',
    attributions: ['IGN-F/Géoportail'],
    url: 'https://wxs.ign.fr/parcellaire/geoportail/wmts',
    layer: 'CADASTRALPARCELS.PARCELS',
    matrixSet: 'PM',
    format: 'image/png',
    origin: [-20037508, 20037508],
    visible: true,
    default: true
  },
  {
    type: 'OSM',
    key: 'osm',
    visible: true,
    default: false
  }
];
