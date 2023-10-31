import { Injectable } from "@angular/core";
import { OAuthStorage } from "angular-oauth2-oidc";
import { PreferenceService } from "./preference.service";

@Injectable()
export class CustomOAuthStorageService extends OAuthStorage {

    private data: Record<string, any> = {};
    private storageKey: string = 'storage_oauth'

    constructor(
        private preferenceService: PreferenceService
    ) {
        super();
    }

    /** load initial data from storage. */
    async init() {
        let res;
        try {
            res = await this.preferenceService.getPreference(this.storageKey);
        } catch (e) {
            this.setItem(this.storageKey, JSON.stringify(this.data));
        }

        this.data = (res) ? JSON.parse(res) : {};
    }

    getItem(key: string) {
        return this.data[key];
    }

    removeItem(key: string) {
        delete this.data[key];
        this.preferenceService.setPreference(this.storageKey, JSON.stringify(this.data)).then();
    }

    setItem(key: string, value: any) {
        this.data[key] = value;
        this.preferenceService.setPreference(this.storageKey, JSON.stringify(this.data)).then();
    }

}