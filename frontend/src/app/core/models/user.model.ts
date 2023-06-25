import { UserContext } from "./user-context.model";

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    imgUrl: string;
    userContext: UserContext;
    usrConfiguration: UserConfiguration;
}

export interface UserConfiguration {
    favorites: Favorite[];
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