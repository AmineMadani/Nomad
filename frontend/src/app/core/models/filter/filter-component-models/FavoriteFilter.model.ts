import { MapService } from "src/app/core/services/map.service";
import { BaseFilterData, BaseFilter } from "./BaseFilter.model";

export class FavoriteFilter implements BaseFilter {
    public id: number;
    public isRecordableFavorite: boolean;
    public position: number;
    public data: FavoriteData[];

    constructor(id: number, isRecordableFavorite: boolean, position: number, data: FavoriteData[]) {
        this.id = id;
        this.isRecordableFavorite = isRecordableFavorite;
        this.position = position;
        this.data = data;
    }

    public getType(): string {
        return 'favoriteFilter';
    }

    public reset(mapService:MapService): void {
        for(let data of this.data){
            data.value=false;
            data.isOpen=false;
        }
    }

    public isSelectedData():boolean {
        for(let data of this.data){
            if(data.value){
                return true;
            }
        }
        return false;
    }

    public applyFavorite(mapService: MapService): void {
    }

    public getFavorites(): FavoriteItem[] {
        return [];
    }
}

export interface FavoriteData extends BaseFilterData {
    dataSave?: FavoriteItem[];
    isOpen?: boolean;
    segmentId?: number;
}

export interface FavoriteItem {
    id: number;
    value: boolean | string;
}