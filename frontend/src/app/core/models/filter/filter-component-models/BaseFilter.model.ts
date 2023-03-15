import { MapService } from "src/app/core/services/map.service"
import { FavoriteItem } from "./FavoriteFilter.model";

export interface BaseFilter{
    id:number,
    isRecordableFavorite:boolean,
    position: number,
    getType(): string,
    reset(mapService:MapService): void,
    isSelectedData(): boolean,
    applyFavorite(mapService:MapService,favoriteItem:FavoriteItem): void,
    getFavorites():FavoriteItem[]
}

export interface BaseFilterData{
    name: string,
    value?: boolean | string,
    position: number,
    id?: number
}