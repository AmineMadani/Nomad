import { OrganizationalUnit } from "./organizational-unit.model";

export interface Contract {
  id: number;
  ctrCode: string;
  ctrSlabel: string;
  ctrLlabel: string;
  ctrValid: boolean;
  ctrStartDate: Date;
  ctrEndDate: Date;
}

export interface ContractWithOrganizationalUnits {
  id: number;
  ctrCode: string;
  ctrSlabel: string;
  ctrLlabel: string;
  ctrValid: boolean;
  organizationalUnits: OrganizationalUnit[];
}
