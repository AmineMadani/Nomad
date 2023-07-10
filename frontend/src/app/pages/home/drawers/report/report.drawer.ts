import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomTask, CustomWorkOrder } from 'src/app/core/models/workorder.model';
import { ExploitationDataService } from 'src/app/core/services/dataservices/exploitation.dataservice';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';
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
    private exploitationDataService: ExploitationDataService
  ) {
  }

  public workorder: CustomWorkOrder;

  ngOnInit() {
    let id = Number.parseInt(this.router.snapshot.paramMap.get('id'));
    //display and zoom on the workorder
    this.layerDataService.getEquipmentByLayerAndId('workorder', id).then(wko => {
      this.mapService.onMapLoaded().subscribe(() => {
        this.layerService
          .moveToXY(wko[0].longitude, wko[0].latitude)
          .then(() => {
            this.layerService.zoomOnXyToFeatureByIdAndLayerKey('workorder', id.toString());
          });
      })
    });
    //display the equipment of all tasks
    this.exploitationDataService.getWorkorderById(id).subscribe(workorder => {
      this.workorder = workorder;
      for(let task of workorder.tasks) {
        this.mapService.onMapLoaded().subscribe(() => {
          this.mapService.addEventLayer(task.assObjTable.replace('asset.',''));
        });
      }
    });
  }
}
