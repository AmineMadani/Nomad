import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, takeUntil } from 'rxjs';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.drawer.html',
  styleUrls: ['./report.drawer.scss'],
})
export class ReportDrawer implements OnInit {

  constructor(
    private drawerService: DrawerService,
    private utils: UtilsService,
    private router: ActivatedRoute,
    private layerDataService: LayerDataService,
    private layerService: LayerService,
    private mapService: MapService
  ) {
    let id = Number.parseInt(this.router.snapshot.paramMap.get('id'));
    this.layerDataService.getEquipmentByLayerAndId('workorder', id).then(wko => {
      this.mapService.onMapLoaded().subscribe(() => {
        this.layerService
          .moveToXY(wko[0].longitude, wko[0].latitude)
          .then(() => {
            this.layerService.zoomOnXyToFeatureByIdAndLayerKey('workorder', id.toString());
          });
      })
    });

  }

  public isMobile: boolean;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
  }

  /**
   * Get the title
   * @returns Formatted title
   */
  public getTitle(): string {
    let val = "Validation l'élément du patrimoine";
    return val;
  }

  public onDrawerBack(): void {
    this.drawerService.setLocationBack();
  }

  onClose() {
    this.drawerService.closeDrawer();
  }

}
