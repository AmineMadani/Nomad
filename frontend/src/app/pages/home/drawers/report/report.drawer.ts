import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Workorder } from 'src/app/core/models/workorder.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { MapEventService, MultiSelection } from 'src/app/core/services/map/map-event.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.drawer.html',
  styleUrls: ['./report.drawer.scss'],
})
export class ReportDrawer implements OnInit {

  constructor(
    private router: ActivatedRoute,
    private layerService: LayerService,
    private mapService: MapService,
    private mapEvent: MapEventService,
    private workorderService: WorkorderService
  ) {
  }

  public workorder: Workorder;

  ngOnInit() {
    let id = Number.parseInt(this.router.snapshot.paramMap.get('id'));

    this.layerService.getEquipmentByLayerAndId('workorder', id.toString()).then(wko => {
      this.workorderService.getWorkorderById(wko.wko_id).then(workorder => {
        this.workorder = workorder;
      });
    });
  }

  ngOnDestroy(): void {
    this.mapEvent.highlighSelectedFeatures(this.mapService.getMap(), undefined);
    this.mapEvent.highlightHoveredFeatures(this.mapService.getMap(), undefined);
  }
}
