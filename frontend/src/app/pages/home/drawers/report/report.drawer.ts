import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Workorder } from 'src/app/core/models/workorder.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { LayerService } from 'src/app/core/services/layer.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.drawer.html',
  styleUrls: ['./report.drawer.scss'],
})
export class ReportDrawer implements OnInit {

  constructor(
    private router: ActivatedRoute,
    private mapLayerService: MapLayerService,
    private layerService: LayerService,
    private mapService: MapService,
    private exploitationService: WorkorderService
  ) {
  }

  public workorder: Workorder;

  ngOnInit() {
    let id = Number.parseInt(this.router.snapshot.paramMap.get('id'));
    //display and zoom on the workorder
    this.layerService.getEquipmentByLayerAndId('workorder', id.toString()).then(wko => {
      this.mapService.onMapLoaded().subscribe(() => {
        this.mapLayerService
          .moveToXY(wko.longitude, wko.latitude)
          .then(() => {
            this.mapLayerService.zoomOnXyToFeatureByIdAndLayerKey('workorder', id.toString()).then(() => {
              //display the equipment of all tasks
              this.exploitationService.getWorkorderById(wko.wko_id).then(workorder => {
                this.workorder = workorder;
                for (let task of workorder.tasks) {
                  this.mapService.addEventLayer(task.assObjTable.replace('asset.', ''));
                  let feature: any = this.mapLayerService.getFeatureById("workorder", task.id + '');
                  feature.geometry.coordinates = [task.longitude, task.latitude];
                  this.mapService.updateFeature("workorder", feature);
                }
              });
            });
          });
      })
    });
  }
}
