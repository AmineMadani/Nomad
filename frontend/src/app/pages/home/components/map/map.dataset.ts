export interface Basemap {
  type: string;
  key: string;
  alias: string;
  attributions?: string[];
  url?: string;
  layer?: string;
  matrixset?: string;
  format?: string;
  origin?: number[];
  display: boolean;
  default: boolean;
}
