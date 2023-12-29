export interface City {
  id: number;
  ctyCode: string;
  ctySlabel: string;
  ctyLlabel: string;
  ctyValid: boolean;
}

export function getCityLabel(city: City): string {
  return city.ctyLlabel;
}
