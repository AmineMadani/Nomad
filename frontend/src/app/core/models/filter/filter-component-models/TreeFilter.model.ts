import { BaseFilter, BaseFilterData } from "./BaseFilter.model";

export class TreeFilter implements BaseFilter{
    public id: number;
    public isRecordableFavorite: boolean;
    public position: number;
    public data: TreeData[];

    constructor(id?: number, isRecordableFavorite?: boolean, position?: number, data?: TreeData[]) {
        this.id = id;
        this.isRecordableFavorite = isRecordableFavorite;
        this.position = position;
        this.data = data;
    }

    public getType(): string {
        return 'treeFilter';
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

    private recursiveReset(data: TreeData): void {
        data.value=false;
        if(data.children) {
            for(let child of data.children) {
                this.recursiveReset(child);
            }
        }
    }

    private recursiveSelectedData(data: TreeData): boolean {
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

export interface TreeData extends BaseFilterData {
    imgSrc?: string;
    key?: string;
    children?: TreeData[];
    isIndeterminate?: boolean
}
