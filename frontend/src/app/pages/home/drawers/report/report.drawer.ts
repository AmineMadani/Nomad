import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Workorder } from 'src/app/core/models/workorder.model';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';
import { ExploitationService } from 'src/app/core/services/exploitation.service';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { MapService } from 'src/app/core/services/map/map.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.drawer.html',
  styleUrls: ['./report.drawer.scss'],
})
export class ReportDrawer implements OnInit {

  constructor(
    private router: ActivatedRoute,
    private layerDataService: LayerDataService,
    private layerService: LayerService,
    private mapService: MapService,
    private exploitationService: ExploitationService
  ) {
  }

  public workorder: Workorder;

  ngOnInit() {
    let id = Number.parseInt(this.router.snapshot.paramMap.get('id'));
    //display and zoom on the workorder
    this.layerDataService.getEquipmentByLayerAndId2('workorder', id.toString()).then(wko => {
      this.mapService.onMapLoaded().subscribe(() => {
        this.layerService
          .moveToXY(wko.longitude, wko.latitude)
          .then(() => {
            this.layerService.zoomOnXyToFeatureByIdAndLayerKey('workorder', id.toString()).then(() => {
              //display the equipment of all tasks
              this.exploitationService.getWorkorderById(wko.wko_id).then(workorder => {
                this.workorder = workorder;
                for (let task of workorder.tasks) {
                  this.mapService.addEventLayer(task.assObjTable.replace('asset.', ''));
                  let feature: any = this.layerService.getFeatureById("workorder", task.id + '');
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
