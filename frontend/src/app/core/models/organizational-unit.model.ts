export interface OrganizationalUnit {
  id: number;
  orgCode: string;
  orgSlabel: string;
  orgLlabel: string;
  outCode: OutCodeEnum;
  orgValid: boolean;
  orgParentId: number;
  orgParentLlabel: string;
}

export enum OutCodeEnum {
  REGION = 'REGION',
  TERRITORY = 'TERRITORY',
}
