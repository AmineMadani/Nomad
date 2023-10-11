import { ValueLabel } from "./util.model";

export interface ReportQuestionDto {
  id: number;
  rqnCode: string;
  rqnSlabel: string;
  rqnLlabel: string;
  rqnType: string;
  rqnRequired: boolean;
  rqnSelectValues: string;
}

export enum RqnTypeEnum {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  SELECT_MULTIPLE = 'select_multiple',
  COMMENT = 'comment'
}

export const LIST_RQN_TYPE: ValueLabel[] = [
  {value: RqnTypeEnum.TEXT, label: 'Saisie libre'},
  {value: RqnTypeEnum.NUMBER, label: 'Valeur numérique'},
  {value: RqnTypeEnum.SELECT, label: 'Liste de valeurs'},
  {value: RqnTypeEnum.SELECT_MULTIPLE, label: 'Liste de valeurs avec multiples selections'},
  {value: RqnTypeEnum.COMMENT, label: 'Commentaire'},
]