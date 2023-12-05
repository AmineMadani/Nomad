import { Pipe, PipeTransform } from '@angular/core';
import { UtilsService } from 'src/app/core/services/utils.service';

@Pipe({
  name: 'mapScale'
})
export class MapScalePipe implements PipeTransform {
  constructor(private utils: UtilsService) {}

  transform(zoom: number, ...args: number[]): string {
    return this.utils.calculateMapScale(zoom, args?.[0]);
  }

}
