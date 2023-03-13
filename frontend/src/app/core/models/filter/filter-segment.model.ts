import { AccordeonFilter } from "./filter-component-models/AccordeonFilter.model";
import { FavoriteFilter } from "./filter-component-models/FavoriteFilter.model";
import { TreeFilter } from "./filter-component-models/TreeFilter.model";

export interface FilterSegment {
    id:number,
    position: number,
    name: string,
    selected: boolean,
    components: (AccordeonFilter | TreeFilter | FavoriteFilter)[]
}