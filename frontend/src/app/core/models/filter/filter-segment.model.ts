import { AccordeonFilter } from "./filter-component-models/AccordeonFilter.model";
import { FavoriteFilter } from "./filter-component-models/FavoriteFilter.model";
import { WorkOrderFilter } from "./filter-component-models/WorkOrderFilter.model";
import { SearchFilter } from "./filter-component-models/SearchFilter.model";
import { ToggleFilter } from "./filter-component-models/ToggleFilter.model";
import { TreeFilter } from "./filter-component-models/TreeFilter.model";

export type FilterType = (AccordeonFilter | TreeFilter | ToggleFilter | SearchFilter | WorkOrderFilter | FavoriteFilter | any);

export interface FilterSegment {
    id:number,
    position: number,
    name: string,
    selected: boolean,
    components: FilterType[]
}