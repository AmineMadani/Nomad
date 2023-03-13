import { BaseFilterData, BaseFilter } from "./BaseFilter.model";

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

    getType(): string {
        return 'accordeonFilter';
    }
}

export interface AccordeonData extends BaseFilterData {
    imgSrc?: string;
    key?: string;
    children?: AccordeonData[];
    isIndeterminate?: boolean
}