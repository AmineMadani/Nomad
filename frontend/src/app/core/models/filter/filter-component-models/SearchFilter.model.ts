import { BaseFilter, BaseFilterData } from './BaseFilter.model';

export class SearchFilter implements BaseFilter {
  public id: number;
  public isRecordableFavorite: boolean;
  public position: number;
  public data: SearchData;
  public tableKey: string;

  constructor(
    id: number,
    isRecordableFavorite: boolean,
    position: number,
    tableKey: string,
    data: SearchData
  ) {
    this.id = id;
    this.isRecordableFavorite = isRecordableFavorite;
    this.position = position;
    this.tableKey= tableKey;
    this.data = data;
  }

  isSelectedData(): boolean {
    throw new Error('Method not implemented.');
  }

  getType(): string {
    return 'searchFilter';
  }

  reset(): void {
    this.data.value = false;
  }
}

export interface SearchData extends BaseFilterData {
    selects?: Select[];
    dateKey?: string[];
}

export interface Select {
    label: string;
    key: string;
    choices: Map<string,string>;
}
