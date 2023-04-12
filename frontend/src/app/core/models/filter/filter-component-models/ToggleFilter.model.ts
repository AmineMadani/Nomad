import { BaseFilter, BaseFilterData } from './BaseFilter.model';

export class ToggleFilter implements BaseFilter {
  public id: number;
  public isRecordableFavorite: boolean;
  public position: number;
  public data: ToggleData[];

  constructor(
    id: number,
    isRecordableFavorite: boolean,
    position: number,
    data: ToggleData[]
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
    return 'toggleFilter';
  }

  reset(): void {
    for (let data of this.data) {
      data.value = false;
    }
  }
}

export interface ToggleData extends BaseFilterData {
  key: string;
}
