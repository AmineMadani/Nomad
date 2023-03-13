import { FilterSegment } from "./filter-segment.model";

export interface Filter {
    id: number,
    segments: FilterSegment[]
}