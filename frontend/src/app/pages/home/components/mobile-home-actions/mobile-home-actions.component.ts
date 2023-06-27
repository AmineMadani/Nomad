import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { ReferentialService } from 'src/app/core/services/referential.service';

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
    private router: Router
  ) {}

  public type: 'DISPLAY' | 'ACTIONS' | 'TOOLS';
  public drawerRouteEnum = DrawerRouteEnum;

  ngOnInit(): void {}

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

    this.router.navigate(['/home/work-order'], {
      queryParams: params,
    });
  }

  public onPolygonTool(): void {
    (
      document.getElementsByClassName(
        'mapbox-gl-draw_ctrl-draw-btn'
      )[0] as HTMLButtonElement
    ).click();
  }
}
