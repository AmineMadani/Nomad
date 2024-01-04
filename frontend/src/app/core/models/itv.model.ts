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

export interface ItvDetail {
  id: number;
  itvFilename: string;
  itvStatus: string;
  itvDcre: Date;
  itvStructuralDefect: boolean;
  itvFunctionalDefect: boolean;
  itvObservation: boolean;
  listItvBlock: ItvBlock[];
}

export interface ItvBlock {
  id: number;
  lyrTableName: string;
  itbObjRef: string;
  itbStructuralDefect: boolean;
  itbFunctionalDefect: boolean;
  itbObservation: boolean;
  address: string;
  city: string;
  startNodeId: string;
  endNodeId: string;
}