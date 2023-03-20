import { BaseFilter, BaseFilterData } from './BaseFilter.model';

export class SearchFilter implements BaseFilter {
  public id: number;
  public isRecordableFavorite: boolean;
  public position: number;
  public data: SearchData[];

  constructor(
    id: number,
    isRecordableFavorite: boolean,
    position: number,
    data: SearchData[]
  ) {
    this.id = id;
    this.isRecordableFavorite = isRecordableFavorite;
    this.position = position;
    this.data = data;
  }

  isSelectedData(): boolean {
    throw new Error('Method not implemented.');
  }

  getType(): string {
    return 'searchFilter';
  }

  reset(): void {
    for (let data of this.data) {
      data.value = false;
    }
  }
}

export interface SearchData extends BaseFilterData {
    selects?: Select[];
}

export interface Select {
    label: string;
    key: string;
    choices: string[];
}
