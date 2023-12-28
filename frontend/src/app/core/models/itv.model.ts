export interface Itv {
  id: number;
  itvFilename: string;
  itvStatus: string;
  itvDcre: Date;
  itvStructuralDefect: boolean;
  itvFunctionalDefect: boolean;
  itvObservation: boolean;
}

export interface ItvPaginated {
  contractIds: number[];
  cityIds: number[];
  status: string[];
  defects: string[];
  startDate: string;
  endDate: string;
}

export interface ItvPictureDto {
  id: number;
  itpLabel: string;
  itpReference: string;
  file?: File;
}