import { Component, Input, OnInit } from '@angular/core';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { FilterService } from '../../filter.service';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';

@Component({
  selector: 'app-filter-work-order',
  templateUrl: './filter-work-order.component.html',
  styleUrls: ['./filter-work-order.component.scss'],
})
export class FilterWorkOrderComponent implements OnInit {
  constructor(
    private filterService: FilterService,
    private drawer: DrawerService
  ) {}

  @Input() data: any;

  public workOrders: MapFeature[] = [];
  public isFromCache: boolean = false;

  ngOnInit() {}

  public getFeatures(): any[] {
    const res = this.filterService.getData('intervention');
    if (this.workOrders?.length !== res?.length) {
      if (!(res[0] instanceof MapFeature)) {
        this.isFromCache = true;
        this.workOrders = res.map((f: any) =>
          MapFeature.from(f.getProperties(), true)
        );
      } else {
        this.isFromCache = false;
        this.workOrders = res;
      }
    }
    return this.workOrders;
  }

  public getPaginationData(ev: InfiniteScrollCustomEvent): void {
    this.filterService.updateData(this.data.type, ev);
  }

  public openIntervention(feature: MapFeature): void {
    const layer = 'intervention';
    const route = this.data.type === 'intervention' ? DrawerRouteEnum.WORKORDER : DrawerRouteEnum.DEMANDE;
    this.drawer.navigateTo(
      route,
      [feature.id],
      { layer, ...feature }
    );
  }
}
