import { Subscription } from 'rxjs';
import { Layer, LayerTypeEnum, layers } from './layer.model';

export class MaplibreLayer {
  constructor(layerKey: string) {
    this.conf = layers.find((l) => l.key === layerKey)!;
    this.key = layerKey;
    this.source = this.buildSource();

    if (this.conf.type === LayerTypeEnum.LINE) {
      this.style = this.layerStyle.get('aep_canalisation');
    } else if (this.conf.type === LayerTypeEnum.VANNE) {
      this.style = this.layerStyle.get('aep_vanne');
    } else {
      this.style = this.layerStyle.get('aep_point');
      this.style[0].id = 'layer-' + layerKey;
      this.style[0].source = layerKey;
      this.style[0].paint['circle-color'] = this.random_rgba(); 
    }

    this.subscriptions = new Subscription();
  }

  public key: string;
  public source: any;
  public style: any[];
  public conf: Layer;
  public subscriptions: Subscription;

  private buildSource(): any {
    return {
      type: 'geojson',
      generateId: true,
      promoteId: 'id',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    };
  }

  random_rgba() {
    var o = Math.round,
      r = Math.random,
      s = 255;
    return (
      'rgba(' +
      o(r() * s) +
      ',' +
      o(r() * s) +
      ',' +
      o(r() * s) +
      ',' +
      1 +
      ')'
    );
  }

  layerStyle: Map<string, any[]> = new Map([
    [
      'aep_canalisation',
      [
        {
          id: 'aep_canalisation_style_1',
          type: 'line',
          source: 'aep_canalisation',
          minzoom: 10,
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
            visibility: 'visible',
          },
          paint: {
            'line-width': [
              'case',
              ['==', ['get', 'ecoulement'], 'Refoulement'],
              4,
              ['==', ['get', 'ecoulement'], 'Surpressé'],
              3,
              3,
            ],
            'line-color': [
              'case',
              ['!=', ['get', 'exploitant'], 'Veolia'],
              '#000000',
              ['coalesce', ['get', 'cde_rvb'], '#00A1FF'],
            ],
            'line-dasharray': ['literal', [3, 2]],
          },
          filter: ['!=', ['get', 'ecoulement'], 'Gravitaire'],
        },
        {
          id: 'aep_canalisation_style_2',
          type: 'line',
          source: 'aep_canalisation',
          minzoom: 10,
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
            visibility: 'visible',
          },
          paint: {
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              6,
              ['boolean', ['feature-state', 'hover'], false],
              8,
              ['==', ['get', 'ecoulement'], 'Refoulement'],
              4,
              ['==', ['get', 'ecoulement'], 'Surpressé'],
              3,
              3,
            ],
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#FFC0CB',
              ['!=', ['get', 'exploitant'], 'Veolia'],
              '#000000',
              ['coalesce', ['get', 'cde_rvb'], '#00A1FF'],
            ],
            'line-dasharray': ['literal', [1, 2]],
          },
          filter: ['==', '$type', 'LineString'],
        },
        {
          id: 'aep_canalisation_style_3',
          type: 'symbol',
          source: 'aep_canalisation',
          minzoom: 16,
          layout: {
            'text-size': 12,
            'text-allow-overlap': true,
            'symbol-spacing': 159,
            'symbol-placement': 'line',
            'text-rotation-alignment': 'map',
            'text-anchor': 'top',
            'text-pitch-alignment': 'map',
            'text-field': ['to-string', ['get', 'id']],
          },
          paint: {
            'text-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#FFC0CB',
              ['!=', ['get', 'exploitant'], 'Veolia'],
              '#000000',
              ['coalesce', ['get', 'cde_rvb'], '#00A1FF'],
            ],
            'text-halo-width': 10,
            'text-halo-color': 'hsla(0, 0%, 96%, 0)',
          },
        },
      ],
    ],
    [
      'aep_vanne',
      [
        {
          id: 'aep_vanne_style2',
          type: 'circle',
          source: 'aep_vanne',
          minzoom: 18,
          layout: {},
          paint: {
            'circle-radius': 30,
            'circle-color': 'hsl(53, 59%, 79%)',
            'circle-blur': 0.5,
            'circle-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              1,
              0,
            ],
          },
        },
        {
          id: 'aep_vanne_style1',
          type: 'symbol',
          source: 'aep_vanne',
          minzoom: 14,
          layout: {
            'icon-allow-overlap': true,
            'icon-image': [
              'match',
              ['get', 'position'],
              ['Fermé'],
              'AEP_VANNE_FERMEE',
              'AEP_VANNE',
            ],
            'icon-rotate': ['+', ['get', 'angle'], 90],
            'icon-rotation-alignment': 'map',
            'icon-ignore-placement': true,
            'icon-size': ['case', ['==', ['get', 'position'], 'Fermé'], 1, 0.8],
            'symbol-spacing': 10,
            'symbol-sort-key': ['case', ['==', 'position', 'Fermé'], 1, 2],
          },
          paint: {},
        },
      ],
    ],
    [
      'aep_point',
      [
        {
          id: 'aep_point_style',
          type: 'circle',
          source: 'aep_vanne',
          minzoom: 14,
          layout: {},
          paint: {
            'circle-radius': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              20,
              ['boolean', ['feature-state', 'hover'], false],
              12,
              7.5,
            ],
            'circle-color': 'hsl(53, 59%, 79%)',
            'circle-blur': 0.1,
            'circle-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              1,
              ['boolean', ['feature-state', 'hover'], false],
              1,
              0.7,
            ],
          },
        },
      ],
    ],
  ]);
}
