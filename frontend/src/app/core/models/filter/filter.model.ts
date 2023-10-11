import { FilterSegment } from "./filter-segment.model";

export interface Filter {
    id: number,
    segments: FilterSegment[]
}
export interface FilterAsset {
    name: string;
    imgSource?: string;
    segment?: boolean;
    segmentName?: string;
    customFilter?: CustomFilter[];
    layerKey?: string;
    styleKey?: string;
    child?: FilterAsset[];
    visible?: boolean;
    segmentVisible?: boolean;

    selected?: boolean;
    isIndeterminate?: boolean;
    closedAccordion?: boolean;
}
export interface CustomFilter {
    type: string,
    name: string,
    key: string,
    value: string,
    checked?: boolean,
    segmentVisible?: boolean
}