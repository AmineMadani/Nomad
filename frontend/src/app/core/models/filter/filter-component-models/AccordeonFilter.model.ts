import { BaseFilterData, BaseFilter } from "./BaseFilter.model";

export class AccordeonFilter implements BaseFilter {
    public id: number;
    public isRecordableFavorite: boolean;
    public position: number;
    public data: AccordeonData[];

    constructor(id?: number, isRecordableFavorite?: boolean, position?: number, data?: AccordeonData[]) {
        this.id = id;
        this.isRecordableFavorite = isRecordableFavorite;
        this.position = position;
        this.data = data;
    }

    public getType(): string {
        return 'accordeonFilter';
    }

    public reset(): void {
        for(let data of this.data){
            this.recursiveReset(data);
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

    private recursiveReset(data: AccordeonData): void {
        data.value=false;
        data.isIndeterminate=false;
        if(data.children) {
            for(let child of data.children) {
                this.recursiveReset(child);
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
    isOpen?: boolean;
    children?: AccordeonData[];
    isIndeterminate?: boolean
}
