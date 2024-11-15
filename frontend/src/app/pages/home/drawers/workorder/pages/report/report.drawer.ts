import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Workorder } from 'src/app/core/models/workorder.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { PraxedoService } from 'src/app/core/services/praxedo.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.drawer.html',
  styleUrls: ['./report.drawer.scss'],
})
export class ReportDrawer implements OnInit {
  constructor(
    private router: ActivatedRoute,
    private mapService: MapService,
    private mapLayerService: MapLayerService,
    private mapEvent: MapEventService,
    private workorderService: WorkorderService,
    private praxedoService: PraxedoService
  ) {}

  public workorder: Workorder;

  ngOnInit() {
    let id = Number.parseInt(this.router.snapshot.paramMap.get('id'));
    if (id) {
      // ### PLANNED CASE ### //

      this.workorderService.getWorkorderById(id).then((workorder) => {
        this.workorder = workorder;
        let taskId = Number.parseInt(
          this.router.snapshot.paramMap.get('taskid')
        );
        if (taskId) {
          const task = this.workorder.tasks.find((task) => task.id === taskId);
          task.isSelectedTask = true;
          task.report.questionIndex = 0;
          this.workorder.isUpdateReport = true;
        }
        if(this.praxedoService.externalReport) {
          this.router.queryParams.subscribe((params) => {
            if (!params['state'] || params['state'] != 'resume') {
              this.mapService.onMapLoaded('home').subscribe(() => {
                this.mapLayerService.jumpToXY('home', this.workorder.longitude,this.workorder.latitude,15);
              });
            }
          })
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.mapEvent.highlighSelectedFeatures(this.mapService.getMap('home'), undefined);
    this.mapEvent.highlightHoveredFeatures(this.mapService.getMap('home'), undefined);
  }
}
