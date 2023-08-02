import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Workorder } from 'src/app/core/models/workorder.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { Subject, filter, takeUntil } from 'rxjs';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';

@Component({
  selector: 'app-wko-view',
  templateUrl: './wko-view.component.html',
  styleUrls: ['./wko-view.component.scss'],
})
export class WkoViewComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private referentialService: ReferentialService,
    private workorderService: WorkorderService,
    private mapLayerService: MapLayerService,
    private mapService: MapService,
    private mapEvent: MapEventService
  ) {}

  public workOrder: Workorder;

  public assetLabel: string;
  public status: string;
  public reason: string;

  private ngUnsubscribe$: Subject<void> = new Subject();

  async ngOnInit(): Promise<void> {
    this.mapService
      .onMapLoaded()
      .pipe(
        filter((isMapLoaded) => isMapLoaded),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(async () => {
        const { id } = this.activatedRoute.snapshot.params;

        this.workOrder = await this.workorderService.getWorkorderById(id);

        await this.mapLayerService.zoomOnXyToFeatureByIdAndLayerKey('workorder', id);

        Promise.all([
          this.referentialService.getReferential('workorder_task_status'),
          this.referentialService.getReferential('workorder_task_reason'),
          this.referentialService.getReferential('asset'),
        ]).then((res) => {
          this.status = res[0].find(
            (refStatus) =>
              refStatus.id.toString() === this.workOrder.wtsId.toString()
          ).wts_llabel;
          this.status =
            this.status.charAt(0).toUpperCase() + this.status.slice(1);
          this.reason = res[1].find(
            (refReason) =>
              refReason.id.toString() ===
              this.workOrder.tasks[0].wtrId.toString()
          ).wtr_llabel;
        });
      });
  }
}
