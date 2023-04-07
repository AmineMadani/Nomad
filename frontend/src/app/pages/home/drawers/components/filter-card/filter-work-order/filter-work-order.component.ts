import { Component, Input, OnInit } from '@angular/core';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { FilterService } from '../../filter.service';

@Component({
  selector: 'app-filter-work-order',
  templateUrl: './filter-work-order.component.html',
  styleUrls: ['./filter-work-order.component.scss'],
})
export class FilterWorkOrderComponent implements OnInit {
  constructor(private filterService: FilterService) {}

  @Input() data: any;

  public workOrders: MapFeature[] = [];
  public isFromCache: boolean = false;

  ngOnInit() {}

  public getFeatures(): any[] {
    const res = this.filterService.getData('intervention');
    if (this.workOrders?.length !== res?.length) {
      if (!(res[0] instanceof MapFeature)) {
        this.isFromCache = true;
        this.workOrders = res.map((f: any) => MapFeature.from(f.getProperties(), true));
      } else {
        this.isFromCache = false;
        this.workOrders = res;
      }
    }
    return this.workOrders;
  }

  public getPaginationData(): void {
    this.filterService.updateData('intervention');
  }

  public onIonInfinite(event: any) {
    console.log(event);
  }
}
