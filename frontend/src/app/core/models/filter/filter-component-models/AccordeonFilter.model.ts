import { MapService } from "src/app/core/services/map.service";
import { BaseFilterData, BaseFilter } from "./BaseFilter.model";
import { FavoriteItem } from "./FavoriteFilter.model";

export class AccordeonFilter implements BaseFilter {
    public id: number;
    public isRecordableFavorite: boolean;
    public position: number;
    public data: AccordeonData[];

    constructor(id: number, isRecordableFavorite: boolean, position: number, data: AccordeonData[]) {
        this.id = id;
        this.isRecordableFavorite = isRecordableFavorite;
        this.position = position;
        this.data = data;
    }

    public getType(): string {
        return 'accordeonFilter';
    }

    public reset(mapService:MapService): void {
        for(let data of this.data){
            this.recursiveReset(data,mapService);
        }
    }

    public isSelectedData():boolean {
        for(let data of this.data){
            if(this.recursiveSelectedData(data)){
                return true;
            }
        }
        return false;
    }

    public applyFavorite(mapService: MapService,favoriteItem: FavoriteItem): void {
        for(let data of this.data){
            this.recursiveApplyFavorite(data,mapService,favoriteItem);
        }
    }

    public getFavorites(): FavoriteItem[] {
        let favoriteItems:FavoriteItem[] = [];
        for(let data of this.data){
            this.recursiveGetFavorite(data,favoriteItems);
        }
        return favoriteItems;
    }

    private recursiveGetFavorite(data: AccordeonData,favoriteItems: FavoriteItem[]): void {
        if(data.value && data.id){
            favoriteItems.push({
                id:data.id,
                value:data.value
            });
        }
        if(data.children) {
            for(let child of data.children) {
                this.recursiveGetFavorite(child,favoriteItems);
            }
        }
    }

    private recursiveReset(data: AccordeonData,mapService:MapService): void {
        data.value=false;
        data.isIndeterminate=false;
        if(data.key && data.key.length > 0) mapService.removeEventLayer(data.key);
        if(data.children) {
            for(let child of data.children) {
                this.recursiveReset(child,mapService);
            }
        }
    }

    private recursiveApplyFavorite(data: AccordeonData,mapService:MapService,favoriteItem:FavoriteItem): void {
        if(data.id === favoriteItem.id && favoriteItem.value) {
            data.value=true;
            if(data.key && data.key.length > 0) mapService.addEventLayer(data.key);
            return;
        } 
        if(data.children) {
            for(let child of data.children) {
                this.recursiveApplyFavorite(child,mapService,favoriteItem);
            }
        }
    }

    private recursiveSelectedData(data: AccordeonData): boolean {
        if(data.value) {
            return true;
        }
        if(data.children) {
            for(let child of data.children) {
                if(this.recursiveSelectedData(child)){
                    return true;
                }
            }
        }
        return false
    }
}

export interface AccordeonData extends BaseFilterData {
    imgSrc?: string;
    key?: string;
    children?: AccordeonData[];
    isIndeterminate?: boolean
}