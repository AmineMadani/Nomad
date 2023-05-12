export interface BackLayer {
  type: string;
  key: string;
  attributions?: string[];
  url?: string;
  layer?: string;
  matrixset?: string;
  format?: string;
  origin?: number[];
  display: boolean;
  default: boolean;
}
