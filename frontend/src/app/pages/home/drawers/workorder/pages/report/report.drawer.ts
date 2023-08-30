import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Workorder } from 'src/app/core/models/workorder.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { Geolocation } from '@capacitor/geolocation';
import { ReferentialService } from 'src/app/core/services/referential.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.drawer.html',
  styleUrls: ['./report.drawer.scss'],
})
export class ReportDrawer implements OnInit {

  constructor(
    private router: ActivatedRoute,
    private mapService: MapService,
    private mapEvent: MapEventService,
    private workorderService: WorkorderService,
    private activatedRoute: ActivatedRoute,
    private referentialService: ReferentialService
  ) {
  }

  public workorder: Workorder;

  ngOnInit() {
    let id = Number.parseInt(this.router.snapshot.paramMap.get('id'));
    if (id) {
      // ### PLANNED CASE ### //

      this.workorderService.getWorkorderById(id).then(workorder => {
        this.workorder = workorder;
      });
    } else {
      // ### UNPLANNED CASE ### //

      this.activatedRoute.queryParams.subscribe(params => {
        this.referentialService.getReferential('workorder_task_status').then(async lStatus => {

          //Define the position 
          let longitude = params['latitude'];
          let latitude = params['longitude'];
          if (!longitude || !latitude) {
            const location = await Geolocation.getCurrentPosition();
            latitude = location.coords.latitude;
            longitude = location.coords.longitude;
          }

          let layer = params['layer'];
          if (!layer) {
            layer = 'asset.aep_xy'
          }

          let reasonId = params['wtrid'];

          //For unplanned workorder/task, the ids is negative
          this.workorder = {
            latitude: latitude,
            longitude: longitude,
            wtsId: lStatus.find(status => status.wts_code == 'CREE')?.id,
            id: (Date.now() + Math.floor(Math.random() * 150000)) * -1,
            tasks: [
              {
                id: (Date.now() + Math.floor(Math.random() * 150000)) * -1,
                latitude: latitude,
                longitude: longitude,
                assObjTable: layer,
                wtrId: reasonId,
                wtsId: lStatus.find(status => status.wts_code == 'CREE')?.id
              }
            ]
          };
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.mapEvent.highlighSelectedFeatures(this.mapService.getMap(), undefined);
    this.mapEvent.highlightHoveredFeatures(this.mapService.getMap(), undefined);
  }
}
