export interface BaseFilter{
    id:number,
    isRecordableFavorite:boolean,
    position: number,
    getType(): string,
    reset(): void
}

export interface BaseFilterData{
    name: string,
    value?: boolean | string,
    position: number,
    id: number
}