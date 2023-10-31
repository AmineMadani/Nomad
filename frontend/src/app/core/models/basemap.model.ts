export interface Basemap {
  map_type: string;
  map_attributions?: string[];
  map_url?: string;
  map_layer?: string;
  map_matrixset?: string;
  map_format?: string;
  map_style?: string;
  map_origin?: number[];
  map_display: boolean;
  map_default: boolean;
  map_slabel?: string;
}

export interface BasemapTemplate {
  name: string;
  link: string;
  size: number;
  selected: boolean;
}
