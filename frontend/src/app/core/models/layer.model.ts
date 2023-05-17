export enum LayerTypeEnum {
  LINE,
  POINT,
  VANNE,
}

export interface Layer {
  id: number;
  key: string;
  type: LayerTypeEnum;
  zindex: number;
  minZoom: number;
  maxZoom: number;
  distance?: number;
  minDistance?: number;
}

export const layers: Layer[] = [
  {
    id: 1,
    key: 'aep_branche',
    type: LayerTypeEnum.POINT,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 2,
    key: 'aep_canalisation',
    type: LayerTypeEnum.LINE,
    zindex: 2,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 3,
    key: 'aep_defense_incendie',
    type: LayerTypeEnum.POINT,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 4,
    key: 'aep_ouvrage',
    type: LayerTypeEnum.POINT,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 5,
    key: 'aep_vanne',
    type: LayerTypeEnum.VANNE,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20,
    distance: 40,
    minDistance: 20
  },
  {
    id: 6,
    key: 'ass_avaloir',
    type: LayerTypeEnum.POINT,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 7,
    key: 'ass_branche',
    type: LayerTypeEnum.POINT,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 8,
    key: 'ass_collecteur',
    type: LayerTypeEnum.LINE,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 9,
    key: 'ass_ouvrage',
    type: LayerTypeEnum.POINT,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 10,
    key: 'ass_regard',
    type: LayerTypeEnum.POINT,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 11,
    key: 'intervention',
    type: LayerTypeEnum.POINT,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 12,
    key: 'demand',
    type: LayerTypeEnum.POINT,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  }
]