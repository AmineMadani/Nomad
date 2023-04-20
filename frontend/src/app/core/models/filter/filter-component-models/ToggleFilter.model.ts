import { BaseFilter, BaseFilterData } from './BaseFilter.model';

export class ToggleFilter implements BaseFilter {
  public id: number;
  public isRecordableFavorite: boolean;
  public position: number;
  public data: ToggleData[];
  public tableKey?: string[];

  constructor(
    id: number,
    isRecordableFavorite: boolean,
    position: number,
    data: ToggleData[],
    tableKey: string[] = null,
  ) {
    this.id = id;
    this.isRecordableFavorite = isRecordableFavorite;
    this.position = position;
    this.data = data;
    this.tableKey = tableKey;
  }

  isSelectedData(): boolean {
    return this.data.some(data => data);
  }

  getType(): string {
    return 'toggleFilter';
  }

  reset(): void {
    for (let data of this.data) {
      data.checked = false;
    }
  }
}

export interface ToggleData extends BaseFilterData {
  key: string;
  checked: boolean;
  value?: string,
}
