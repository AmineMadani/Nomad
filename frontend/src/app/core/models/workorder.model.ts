export interface Workorder {
    id: number;
    wkoName: number;
    wkoEmergency: boolean;
    wkoAppointment: boolean;
    wkoAddress: string;
    wkoPlanningStartDate: Date;
    wkoPlanningEndDate: Date;
    wtsId: number;
    wkoCompletionDate: Date;
    longitude: number;
    latitude: number;
    wkoAgentNb: number;
    tasks: Task[];
    selectedTaskId?: number;
    wkoCreationComment : string;
}

export interface CancelWorkOrder {
    id: number;
    cancelComment: string;
}

export interface Task {
    id:number;
    assObjRef: string;
    assObjTable: string;
    wtsId: string;
    wtrId: string;
    ctrId: string;
    wtrCode?: string;
    wkoId?: string;
    longitude: number;
    latitude: number;
    tskReportDate: Date;
    report?: Report;
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

export enum WkoStatus{
    'CREE' = 1,
    'ENVOYEPLANIF' = 2,
    'PLANIFIE' = 3,
    'TERMINE' = 4,
    'ANNULE' = 5
}