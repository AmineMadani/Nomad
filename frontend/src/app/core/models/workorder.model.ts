export interface Workorder {
    id: number;
    wkoName: string;
    wkoEmergency: boolean;
    wkoAddress: string;
    wkoPlanningStartDate: Date;
    wkoPlanningEndDate: Date;
    wkoCompletionDate: Date;
    wkoRealizationCell: string;
    wkoAgentNb: number;
    assId: number;
    wtsId: number;
    wtsLabel: string;
    wtrId: number;
    wtrLabel: string;
    longitude: number;
    latitude: number;
    status?: any;
}

export interface CustomWorkOrder {
    id: number;
    wkoName: number;
    wkoEmergency: boolean;
    wkoAddress: string;
    wkoPlanningStartDate: Date;
    wkoPlanningEndDate: Date;
    wtsId: number;
    wkoCompletionDate: Date;
    longitude: number;
    latitude: number;
    wkoAgentNb: number;
    tasks: CustomTask[];
}

export interface CustomTask {
    id:number;
    assObjRef: string;
    assObjTable: string;
    wtsId: string;
    wtrId: string;
    longitude: number;
    latitude: number;
    tskCompletionDate: Date;
}