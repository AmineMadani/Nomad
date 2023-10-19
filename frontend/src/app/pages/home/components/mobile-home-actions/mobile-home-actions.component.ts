import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { CityService } from 'src/app/core/services/city.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawingService } from 'src/app/core/services/map/drawing.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-mobile-home-actions',
  templateUrl: './mobile-home-actions.component.html',
  styleUrls: ['./mobile-home-actions.component.scss'],
})
export class MobileHomeActionsComponent implements OnInit {
  constructor(
    private modalCtlr: ModalController,
    private drawerService: DrawerService,
    private mapService: MapService,
    private contractService: ContractService,
    private cityService: CityService,
    private router: Router,
    private userService: UserService,
    private drawingService: DrawingService
    ) {}

  public type: 'DISPLAY' | 'ACTIONS' | 'TOOLS';
  public drawerRouteEnum = DrawerRouteEnum;

  // Permissions
  public userHasPermissionCreateXYWorkorder: boolean = false;

  async ngOnInit(): Promise<void> {
    if (this.drawingService.getIsMeasuring()) {
      this.drawingService.endMesure(true);
    }

    this.userHasPermissionCreateXYWorkorder =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.CREATE_X_Y_WORKORDER);
  }

  public navigateTo(location: DrawerRouteEnum): void {
    this.drawerService.navigateTo(location);
    this.modalCtlr.dismiss();
  }

  public async onGenerateWorkOrder() {
    const centerMapPosition = this.mapService.getMap().getCenter();

    Promise.all([
      this.contractService.getContractIdsByLatitudeLongitude(centerMapPosition.lat, centerMapPosition.lng),
      this.cityService.getCityIdsByLatitudeLongitude(centerMapPosition.lat, centerMapPosition.lng),
    ]).then((results) => {
      const contractIds = results[0];
      const cityIds = results[0];

      let params: any = {};
      params.x = centerMapPosition.lng;
      params.y = centerMapPosition.lat;
      params.lyrTableName = 'xy';
      if (contractIds && contractIds.length > 0) params.ctrId = contractIds.join(',');
      if (cityIds && cityIds.length > 0) params.ctyId = cityIds.join(',');

      this.modalCtlr.dismiss();

      this.drawerService.navigateTo(DrawerRouteEnum.WORKORDER_WATER_TYPE, undefined, params);
    });
  }

  public onPolygonTool(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
    this.modalCtlr.dismiss();
    this.drawingService.setDrawMode('draw_polygon');
  }

  public onRectangleTool(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
    this.drawingService.setDrawMode('draw_rectangle');
    this.modalCtlr.dismiss();
  }

  public async onClickDisplaySurfaceMesureTool(): Promise<void> {
    this.drawingService.setDrawMode('draw_polygon');
    this.drawingService.setIsMeasuring(true);
    this.modalCtlr.dismiss();
  }

  public async onClickDisplayLinearMesureTool(): Promise<void> {
    this.drawingService.setDrawMode('draw_line_string');
    this.drawingService.setIsMeasuring(true);
    this.modalCtlr.dismiss();
  }

  /**
  * Call mapservice to share the click position
  */
  public  async onShareLocalisation() {
    const centerMapPosition = this.mapService.getMap().getCenter();
    this.mapService.sharePosition(centerMapPosition.lat, centerMapPosition.lng);
  }
  /**
   * call mapservice to remone the pin of initial localisation
   */
  public async onRemoveMarker(){
    await this.mapService.removeLocalisationMarker();
  }
}
