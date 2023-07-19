export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    imgUrl: string;
    usrConfiguration: UserConfiguration;
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
