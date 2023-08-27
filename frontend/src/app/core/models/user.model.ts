export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    status: string;
    imgUrl: string;
    usrConfiguration: UserConfiguration;
    perimeters: Perimeter[];
}

export function getUserEmail(user: User) {
  return user.email;
}

export interface UserConfiguration {
    favorites?: Favorite[];
    context?: Context;
}

export interface Context {
    userId?: number;
    zoom?: number;
    layers?: string[][];
    lng?: number;
    lat?: number;
    url?: string;
}

export interface Favorite {
    name: string;
    segment: string;
    layers: Layer[];
    filter?: Filter[];
}

export interface Layer {
    layerKey: string;
    styleKey: string;
}

export interface Filter {
    segmentName: string;
    properties: Property[];
}

export interface Property {
    key: string;
    value: string;
}

export enum LocalStorageUserKey {
    USER = 'user',
    USER_CONTEXT = 'userContext'
}

export interface Perimeter {
  profileId: number;
  contractIds: number[];
}

export interface PerimeterRow extends Perimeter {
  regionIds?: number[];
  territoryIds?: number[];
}

export interface Profile {
  id: number;
  prfCode: ProfileCodeEnum;
  prfSlabel: string;
  prfLlabel: string;
  prfValid: boolean;
}

export interface Permission {
  id: number;
  perCode: PermissionCodeEnum;
  perSlabel: string;
  perLlabel: string;
  perValid: boolean;
  perCategory: string;
  profilesIds: number[];
}

export enum ProfileCodeEnum {
  ADMIN_NAT = 'ADMIN_NAT',
  ADMIN_LOC_1 = 'ADMIN_LOC_1',
  ADMIN_LOC_2 = 'ADMIN_LOC_2',
  MANAGER = 'MANAGER',
  DESKTOP_AGENT = 'DESKTOP_AGENT',
  MOBILE_AGENT = 'MOBILE_AGENT',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
}

export enum PermissionCodeEnum {
  VIEW_ASSET_DETAILLED = 'VIEW_ASSET_DETAILLED',
  VIEW_ALL_WORKORDERS = 'VIEW_ALL_WORKORDERS',
  CREATE_ASSET_WORKORDER = 'CREATE_ASSET_WORKORDER',
  CREATE_X_Y_WORKORDER = 'CREATE_X_Y_WORKORDER',
  SEND_WORKORDER = 'SEND_WORKORDER',
  CREATE_NO_PLAN_WORKORDER = 'CREATE_NO_PLAN_WORKORDER',
  VIEW_ALL_CASES = 'VIEW_ALL_CASES',
  MODIFY_REPORT_MY_AREA = 'MODIFY_REPORT_MY_AREA',
  IMPORT_MASS_REPORT = 'IMPORT_MASS_REPORT',
  REQUEST_UPDATE_ASSET = 'REQUEST_UPDATE_ASSET',
  CREATE_PROGRAM_MY_AREA = 'CREATE_PROGRAM_MY_AREA',
  VIEW_PROGRAM_ELEMENTS = 'VIEW_PROGRAM_ELEMENTS',
  GENERATE_WORKORDERS_FROM_PROGRAM = 'GENERATE_WORKORDERS_FROM_PROGRAM',
  IDENTIFY_VANNE_CLOSE = 'IDENTIFY_VANNE_CLOSE',
  VIEW_STOP_WATER = 'VIEW_STOP_WATER',
  EXPORT_REPORTING = 'EXPORT_REPORTING',
  GENERATE_REPORT = 'GENERATE_REPORT',
  MODIFY_DATA_MASS = 'MODIFY_DATA_MASS',
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  SET_USER_RIGHTS = 'SET_USER_RIGHTS',
  CUSTOMIZE_FORM_FIELDS = 'CUSTOMIZE_FORM_FIELDS',
  CREATE_NEW_FORM_FIELDS = 'CREATE_NEW_FORM_FIELDS',
  MANAGE_USER_PROFILE = 'MANAGE_USER_PROFILE',
}
