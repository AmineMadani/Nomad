import { AccordeonFilter } from "./filter-component-models/AccordeonFilter.model";
import { FavoriteFilter } from "./filter-component-models/FavoriteFilter.model";
import { InterventionFilter } from "./filter-component-models/InterventionFilter.model";
import { SearchFilter } from "./filter-component-models/SearchFilter.model";
import { ToggleFilter } from "./filter-component-models/ToggleFilter.model";
import { TreeFilter } from "./filter-component-models/TreeFilter.model";

export type FilterType = (AccordeonFilter | TreeFilter | ToggleFilter | SearchFilter | InterventionFilter | FavoriteFilter);

export interface FilterSegment {
    id:number,
    position: number,
    name: string,
    selected: boolean,
    components: FilterType[]
}