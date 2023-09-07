import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Workorder } from 'src/app/core/models/workorder.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { Geolocation } from '@capacitor/geolocation';
import { UtilsService } from 'src/app/core/services/utils.service';

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
    private utilsService: UtilsService
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
        this.workorderService.getAllWorkorderTaskStatus().subscribe(async lStatus => {

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
            layer = 'aep_xy'
          }

          let reasonId = params['wtrid'];

          //For unplanned workorder/task, the ids is negative
          this.workorder = {
            latitude: latitude,
            longitude: longitude,
            wtsId: lStatus.find(status => status.wtsCode == 'CREE')?.id,
            id: this.utilsService.createCacheId(),
            tasks: [
              {
                id: this.utilsService.createCacheId(),
                latitude: latitude,
                longitude: longitude,
                assObjTable: layer,
                wtrId: reasonId,
                wtsId: lStatus.find(status => status.wtsCode == 'CREE')?.id
              }
            ]
          };

          this.workorderService.saveCacheWorkorder(this.workorder);
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.mapEvent.highlighSelectedFeatures(this.mapService.getMap(), undefined);
    this.mapEvent.highlightHoveredFeatures(this.mapService.getMap(), undefined);
  }
}
