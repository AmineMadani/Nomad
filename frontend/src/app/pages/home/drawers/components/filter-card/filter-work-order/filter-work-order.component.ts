import { Component, Input, OnInit } from '@angular/core';
import { MapFeature } from 'src/app/core/models/map-feature.model';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { FilterService } from 'src/app/core/services/filter.service';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { Status } from 'src/app/core/models/status.model';

@Component({
  selector: 'app-filter-work-order',
  templateUrl: './filter-work-order.component.html',
  styleUrls: ['./filter-work-order.component.scss'],
})
export class FilterWorkOrderComponent implements OnInit {
  constructor(
    private filterService: FilterService,
    private drawer: DrawerService,
    private referentialService: ReferentialService
  ) {}

  @Input() data: any;

  public workOrders: MapFeature[] = [];
  public isFromCache: boolean = false;
  public lStatus: Status[] = [];
  public isLoading = () => {
    return this.filterService.isLoading;
  };
  

  ngOnInit() {
    this.referentialService.getReferential('workorder_task_status').then(res => {
      this.lStatus = res;
    })
  }

  /**
   * Retrieves and returns a list of features for interventions, either from cache or by
   * mapping properties to MapFeature objects.
   * @returns The `getFeatures()` method is returning an array of `MapFeature` objects, which are either
   * obtained from the `filterService` or cached in the `workOrders` property.
   */
  public getFeatures(): any[] {
    const res = this.filterService.getData('task');
    if (this.workOrders?.length !== res?.length) {
      if (!(res[0] instanceof MapFeature)) {
        this.isFromCache = true;
        this.workOrders = res.map((f: any) =>
          MapFeature.from(f.properties)
        );
      } else {
        this.isFromCache = false;
        this.workOrders = res;
      }
    }
    for(let workorder of this.workOrders) {
      if(!workorder.reason) {
        workorder.reason = workorder['wkoName'];
      }
      if(!workorder.datebegin) {
        workorder.datebegin = workorder['wkoPlanningStartDate'];
      }
      if(!workorder.dateend) {
        workorder.dateend = workorder['wkoPlanningEndDate'];
      }
      if(!workorder.status) {
        workorder.status = workorder['wtsId'];
      }
    }
    return this.workOrders;
  }

  public getPaginationData(ev: InfiniteScrollCustomEvent): void {
    this.filterService.updateData(this.data.type, ev);
  }

  public openIntervention(feature: MapFeature): void {
    const lyr_table_name = 'task';
    const route = this.data.type === 'workorder' ? DrawerRouteEnum.WORKORDER_VIEW : DrawerRouteEnum.DEMANDE;
    this.drawer.navigateTo(route, [feature.id]);
  }

  public getStatus(id:number):Status {
    return this.lStatus.find(status => status.id===id)
  }
}
