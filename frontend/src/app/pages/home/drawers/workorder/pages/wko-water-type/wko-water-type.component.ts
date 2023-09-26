import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { DrawerService } from 'src/app/core/services/drawer.service';

@Component({
  selector: 'app-wko-water-type',
  templateUrl: './wko-water-type.component.html',
  styleUrls: ['./wko-water-type.component.scss'],
})
export class WkoWaterTypeComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private drawerService: DrawerService
  ) {
  }

  ngOnInit() {}

  public onWaterTypeChosen(waterType: 'dw' | 'ww'): void {
    const parameters = { ...this.activatedRoute.snapshot.queryParams,  waterType };

    this.drawerService.navigateTo(
      DrawerRouteEnum.WORKORDER_CREATION,
      undefined,
      parameters
    );
  }
}
