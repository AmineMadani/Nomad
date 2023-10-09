export interface ReportQuestionDto {
  id: number;
  rqnCode: string;
  rqnSlabel: string;
  rqnLlabel: string;
  rqnType: string;
  rqnRequired: boolean;
  rqnSelectValues: string;
}