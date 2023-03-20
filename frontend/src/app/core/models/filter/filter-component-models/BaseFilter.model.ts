export interface BaseFilter{
    id:number,
    isRecordableFavorite:boolean,
    position: number,
    getType(): string,
    reset(): void,
    isSelectedData(): boolean
}

export interface BaseFilterData{
    name: string,
    value?: boolean | string,
    position: number,
    id?: number
}