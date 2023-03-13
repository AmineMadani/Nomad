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

    reset(): void {
        for(let data of this.data){
            this.recursiveReset(data);
        }
    }

    recursiveReset(data: AccordeonData): void {
        data.value=false;
        if(data.children) {
            for(let child of data.children) {
                this.recursiveReset(child);
            }
        }
    }
}

export interface AccordeonData extends BaseFilterData {
    imgSrc?: string;
    key?: string;
    children?: AccordeonData[];
    isIndeterminate?: boolean
}