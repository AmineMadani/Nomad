import { Component, Input, OnInit } from '@angular/core';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { FilterService } from 'src/app/core/services/filter.service';

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

  /**
   * Retrieves and returns a list of features for interventions, either from cache or by
   * mapping properties to MapFeature objects.
   * @returns The `getFeatures()` method is returning an array of `MapFeature` objects, which are either
   * obtained from the `filterService` or cached in the `workOrders` property.
   */
  public getFeatures(): any[] {
    const res = this.filterService.getData('workorder');
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
    const layer = 'workorder';
    const route =
      this.data.type === 'workorder'
        ? DrawerRouteEnum.WORKORDER
        : DrawerRouteEnum.DEMANDE;
    this.drawer.navigateTo(route, [feature.id], { layer, ...feature });
  }
}
