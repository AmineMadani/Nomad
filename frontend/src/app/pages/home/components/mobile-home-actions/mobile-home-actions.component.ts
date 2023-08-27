import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { ReferentialService } from 'src/app/core/services/referential.service';
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
    private referentialService: ReferentialService,
    private router: Router,
    private userService: UserService
    ) {}

  public type: 'DISPLAY' | 'ACTIONS' | 'TOOLS';
  public drawerRouteEnum = DrawerRouteEnum;

  // Permissions
  public userHasPermissionCreateXYWorkorder: boolean = false;

  async ngOnInit(): Promise<void> {
    this.userHasPermissionCreateXYWorkorder =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.CREATE_X_Y_WORKORDER);
  }

  public navigateTo(location: DrawerRouteEnum): void {
    this.drawerService.navigateTo(location);
    this.modalCtlr.dismiss();
  }

  public async onGenerateWorkOrder() {
    const centerMapPosition = this.mapService.getMap().getCenter();
    let l_ctr_id = await firstValueFrom(
      this.referentialService.getReferentialIdByLongitudeLatitude(
        'contract',
        centerMapPosition.lng.toString(),
        centerMapPosition.lat.toString()
      )
    );
    let l_cty_id = await firstValueFrom(
      this.referentialService.getReferentialIdByLongitudeLatitude(
        'city',
        centerMapPosition.lng.toString(),
        centerMapPosition.lat.toString()
      )
    );
    let params: any = {};
    params.x = centerMapPosition.lng;
    params.y = centerMapPosition.lat;
    params.lyr_table_name = 'xy';
    if (l_ctr_id && l_ctr_id.length > 0) params.ctr_id = l_ctr_id.join(',');
    if (l_cty_id && l_cty_id.length > 0) params.cty_id = l_cty_id.join(',');

    this.modalCtlr.dismiss();

    this.router.navigate(['/home/workorder'], {
      queryParams: params,
    });
  }

  public onPolygonTool(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
    this.modalCtlr.dismiss();
    this.mapService.setDrawMode('draw_polygon');
  }

  public onRectangleTool(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
    this.mapService.setDrawMode('draw_rectangle');
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
