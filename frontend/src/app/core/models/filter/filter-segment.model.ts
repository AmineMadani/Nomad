import { WorkOrderFilter } from "./filter-component-models/WorkOrderFilter.model";
import { SearchFilter } from "./filter-component-models/SearchFilter.model";
import { ToggleFilter } from "./filter-component-models/ToggleFilter.model";

export type FilterType = ( ToggleFilter | SearchFilter | WorkOrderFilter | any);

export interface FilterSegment {
    id:number,
    position: number,
    name: string,
    selected: boolean,
    components: FilterType[]
}