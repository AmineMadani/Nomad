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

    getType(): string {
        return 'favoriteFilter';
    }

    reset(): void {
        for(let data of this.data){
            data.value=false;
            data.isOpen=false;
        }
    }
}

export interface FavoriteData extends BaseFilterData {
    dataSave?: FavoriteItem[];
    isOpen?: boolean;
    segmentId?: number;
}

export interface FavoriteItem {
    key: string;
    value: boolean | string;
}