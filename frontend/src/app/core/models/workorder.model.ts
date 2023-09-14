export interface Workorder {
    id?: number;
    wkoName?: number;
    wkoEmergency?: boolean;
    wkoAppointment?: boolean;
    wkoAddress?: string;
    wkoCreationComment?: string;
    wkoPlanningStartDate?: Date;
    wkoPlanningEndDate?: Date;
    wtsId?: number;
    wkoCompletionStartDate?: Date;
    wkoCompletionEndDate?: Date;
    wkoCancelComment?: string;
    longitude?: number;
    latitude?: number;
    wkoAgentNb?: number;
    tasks?: Task[];
    ctyId?: string;
    ctrId?: string;
    wkoAttachment?: boolean;
    wkoExtToSync?: boolean;
    wkoDmod?: Date;
    resync?: boolean; //Param to indicate if the workorder have to be resync with the server
    isDraft?: boolean;
}

export interface CancelWorkOrder {
    id: number;
    cancelComment: string;
}

export interface Task {
    id?: number;
    assObjRef?: string;
    assObjTable: string;
    wtsId?: number;
    wtrId?: number;
    ctrId?: number;
    astCode?: string;
    wtrCode?: string;
    wkoId?: number;
    longitude?: number;
    latitude?: number;
    tskCompletionStartDate?: Date;
    tskCompletionEndDate?: Date;
    tskReportDate?: Date;
    report?: Report;
    isSelectedTask?: boolean;
}

export interface Report {
    dateCompletion: Date;
    reportValues: ReportValue[];
    questionIndex?: number;
}

export interface ReportValue {
    key: string;
    question: string;
    answer: string;
}

export enum WkoStatus {
    'CREE' = 1,
    'ENVOYEPLANIF' = 2,
    'PLANIFIE' = 3,
    'TERMINE' = 4,
    'ANNULE' = 5
}

export interface WorkorderTaskStatus {
    id: number;
    wtsCode: string;
    wtsSlabel: string;
    wtsLlabel: string;
    wtsValid: boolean;
}

export interface WorkorderTaskReason {
    id: number;
    wtrCode: string;
    wtrSlabel: string;
    wtrLlabel: string;
    wtrValid: boolean;
}

export enum WorkorderType {
    DRAFT = 'DRAFT',
    UNPLANNED = 'UNPLANNED',
    PLANNED = 'PLANNED'
}

export interface TaskPaginated {
  wkoEmergeny?: boolean;
  wkoAppointment?: boolean;
  wkoPlanningStartDate?: string;
  wkoPlanningEndDate?: string;
  wtrIds?: number[];
  wtsIds?: number[];
}