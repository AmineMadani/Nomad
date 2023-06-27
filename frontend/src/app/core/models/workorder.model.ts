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