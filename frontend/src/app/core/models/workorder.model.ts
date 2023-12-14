import { AssetForSigDto } from './assetForSig.model';
import { SyncOperations } from '../services/workorder.service';

export interface Workorder {
    id?: number;
    wkoName?: number;
    wkoEmergency?: boolean;
    wkoAppointment?: boolean;
    wkoAddress?: string;
    wkoCreationComment?: string;
    wkoPlanningStartDate?: Date;
    wkoPlanningEndDate?: Date;
    wkoPlanningDuration?: number;
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
    syncOperation?: SyncOperations; // A value wich indicates the method necessary to perform synchronization with the server
    isDraft?: boolean;
    wkoAffair?: number;
    // Specific frontend variables for travo
    tempTravoWtrId?: number;
    travoCallbackUrl?: string;
    isUpdateReport?: boolean;
    // end specific frontend variables for travo
    wkoRealizationUser?: string;
    wkoExtError?: string;
    wkoExtClosure?: boolean;
    //to indicate that some values have changed
    wkoChangedValueZone1?: boolean;
    //to indicate that some values have changed (others)
    wkoChangedValueZone2?: boolean;
}

export function buildWorkorderFromGeojson(featureWorkorder: any): Workorder {
  return {
    id: featureWorkorder.properties['wkoId'],
    latitude: featureWorkorder.properties['y'],
    longitude: featureWorkorder.properties['x'],
    wkoAddress: featureWorkorder.properties['wkoAddress'],
    wkoAgentNb: featureWorkorder.properties['wkoAgentNb'],
    wkoEmergency: featureWorkorder.properties['wkoEmergency'],
    wkoAppointment: featureWorkorder.properties['wkoAppointment'],
    wkoName: featureWorkorder.properties['wkoName'],
    wkoCompletionStartDate: featureWorkorder.properties['wkoCompletionStartDate'],
    wkoCompletionEndDate: featureWorkorder.properties['wkoCompletionEndDate'],
    wkoPlanningStartDate: featureWorkorder.properties['wkoPlanningStartDate'],
    wkoPlanningEndDate: featureWorkorder.properties['wkoPlanningEndDate'],
    wkoPlanningDuration: featureWorkorder.properties['wkoPlanningDuration'],
    wtsId: featureWorkorder.properties['wkoWtsId'],
    wkoCreationComment: featureWorkorder.properties['wkoCreationComment'],
    wkoCancelComment: featureWorkorder.properties['wkoCancelComment'],
    tasks: [],
    ctyId: featureWorkorder.properties['ctyId'],
    ctrId: '',
    wkoAttachment: featureWorkorder.properties['wkoAttachment'],
    wkoExtToSync: featureWorkorder.properties['wkoExtSoSync'],
    wkoRealizationUser: featureWorkorder.properties['wkoRealizationUser'],
    wkoExtError: featureWorkorder.properties['wkoExtError'],
    wkoExtClosure: featureWorkorder.properties['wkoExtClosure'],
  };
}

export interface CancelWorkOrder {
    id: number;
    cancelComment: string;
}

export interface CancelTask {
    id: number;
    tskId: number;
    cancelComment: string;
}

export interface Task {
    id?: number;
    assObjRef?: string;
    assObjTable: string;
    wtsId?: number;
    wtsCode?: string;
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
    tskCancelComment?: string;
    report?: Report;
    isSelectedTask?: boolean;
    assetForSig?: AssetForSigDto;
}

export function buildTaskFromGeojson(task: any): Task {
  return {
    assObjRef: task.properties['assObjRef'],
    assObjTable: task.properties['assObjTable'],
    id: task.properties['id'],
    ctrId: task.properties['ctrId'],
    latitude: task.properties['y'],
    longitude: task.properties['x'],
    tskCompletionStartDate: task.properties['tskCompletionStartDate'],
    tskCompletionEndDate: task.properties['tskCompletionEndDate'],
    tskReportDate: task.properties['tskReportDate'],
    wtrId: task.properties['wtrId'],
    wtsId: task.properties['wtsId'],
    wkoId: task.properties['wkoId'],
  };
}

export function convertTasksToWorkorders(featureTasks: any[]): Workorder[] {
  const workordersMap: { [key: number]: Workorder } = {};

  for (const featureTask of featureTasks) {
    const wkoId: number = featureTask.properties['wkoId'];

    if (!workordersMap[wkoId]) {
      workordersMap[wkoId] = buildWorkorderFromGeojson(featureTask);
    }

    workordersMap[wkoId].tasks.push(buildTaskFromGeojson(featureTask));
  }

  const workorders = Object.values(workordersMap);

  return workorders;
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
    'ANNULE' = 5,
    'ERREUR'= 6
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
    wtrNoXy: boolean;
}

export const WTR_CODE_POSE = '10';

export enum WorkorderType {
    DRAFT = 'DRAFT',
    UNPLANNED = 'UNPLANNED',
    PLANNED = 'PLANNED'
}

export interface TaskPaginated {
  wkoEmergency?: boolean;
  wkoAppointment?: boolean;
  wkoPlanningStartDate?: string;
  wkoPlanningEndDate?: string;
  wtrIds?: number[];
  wtsIds?: number[];
  assObjTables?: string[];
}

export interface CreateWorkorderUrlPayload {
  lyrTableName?: string;
  x?: number;
  y?: number;
}

export interface UpdateWorkorderUrlPayload {
  [key: string]: any;
}

export interface TravoUrlPayload {
  wkoAffair?: string;
  wkoName?: string;
  x?: number;
  y?: number;
  astCode?: string;
  wtrCode?: string;
  wkoChantier?: string; // Need to be create in a specific US
  ctrCode?: string; // Filtrer la liste dispo sur le XY
  wkoPlanningStartDate?: string;
  wkoPlanningEndDate?: string;
  wkoCreationComment?: string;
  callbackUrl?: string;

  // Not asked but set after with astCode and wtrCode in the app
  lyrTableName?: string;
}
export function isUrlFromTravo(obj: any): obj is TravoUrlPayload {
  return obj && 'wkoAffair' in obj;
}

export function isUrlFromTravoValid(obj: TravoUrlPayload): boolean {
  return 'wkoAffair' in obj &&
    'x' in obj &&
    'y' in obj &&
    'astCode' in obj &&
    'wtrCode' in obj &&
    'callbackUrl' in obj;
}
