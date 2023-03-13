import { BaseFilter, BaseFilterData } from "./BaseFilter.model";

export class TreeFilter implements BaseFilter{
    public id: number;
    public isRecordableFavorite: boolean;
    public position: number;
    public data: TreeData[];

    constructor(id: number, isRecordableFavorite: boolean, position: number, data: TreeData[]) {
        this.id = id;
        this.isRecordableFavorite = isRecordableFavorite;
        this.position = position;
        this.data = data;
    }

    getType(): string {
        return 'treeFilter';
    }

    reset(): void {
        for(let data of this.data){
            this.recursiveReset(data);
        }
    }

    recursiveReset(data: TreeData): void {
        data.value=false;
        if(data.children) {
            for(let child of data.children) {
                this.recursiveReset(child);
            }
        }
    }

}

export interface TreeData extends BaseFilterData {
    imgSrc?: string;
    key?: string;
    children?: TreeData[];
    isIndeterminate?: boolean
}