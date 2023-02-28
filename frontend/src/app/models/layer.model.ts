export enum LayerTypeEnum {
  VECTOR,
  CLUSTER,
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
    type: LayerTypeEnum.VECTOR,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 2,
    key: 'aep_canalisation',
    type: LayerTypeEnum.VECTOR,
    zindex: 2,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 3,
    key: 'aep_defense_incendie',
    type: LayerTypeEnum.VECTOR,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 4,
    key: 'aep_ouvrage',
    type: LayerTypeEnum.VECTOR,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 5,
    key: 'aep_vanne',
    type: LayerTypeEnum.CLUSTER,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20,
    distance: 40,
    minDistance: 20
  },
  {
    id: 6,
    key: 'ass_avaloir',
    type: LayerTypeEnum.VECTOR,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 7,
    key: 'ass_branche',
    type: LayerTypeEnum.VECTOR,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 8,
    key: 'ass_collecteur',
    type: LayerTypeEnum.VECTOR,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 9,
    key: 'ass_ouvrage',
    type: LayerTypeEnum.VECTOR,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  },
  {
    id: 10,
    key: 'ass_regard',
    type: LayerTypeEnum.VECTOR,
    zindex: 1,
    minZoom: 16,
    maxZoom: 20
  }
]