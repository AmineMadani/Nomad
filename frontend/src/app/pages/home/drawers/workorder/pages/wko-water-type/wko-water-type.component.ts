import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { Workorder } from 'src/app/core/models/workorder.model';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { WorkorderService } from 'src/app/core/services/workorder.service';

@Component({
  selector: 'app-wko-water-type',
  templateUrl: './wko-water-type.component.html',
  styleUrls: ['./wko-water-type.component.scss'],
})
export class WkoWaterTypeComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private drawerService: DrawerService,
    private workorderService: WorkorderService,
    private router: Router,
    private utilsService: UtilsService
  ) {
    activatedRoute.queryParams.subscribe(params => { 
      if(params['target'] == 'report' ){
        this.type = 'report';
      } else {
        this.type = 'wko';
      }
    }); 
  }

  public type: String = "wko";

  ngOnInit() {
  }

  public onWaterTypeChosen(waterType: 'dw' | 'ww'): void {
    const parameters = { ...this.activatedRoute.snapshot.queryParams,  waterType };

    if(this.type == 'wko') {
      this.drawerService.navigateTo(
        DrawerRouteEnum.WORKORDER_CREATION,
        undefined,
        parameters
      );
    } else {
      let workorder: Workorder = {
        latitude: parameters['y'],
        longitude: parameters['x'],
        wtsId: parameters['wtsId'],
        id: this.utilsService.createCacheId(),
        isDraft: true,
        ctyId: parameters['ctyId'],
        tasks: [
          {
            id: this.utilsService.createCacheId(),
            latitude: parameters['y'],
            longitude: parameters['x'],
            assObjTable: waterType == 'dw' ? 'aep_xy':'ass_xy',
            assObjRef: null,
            wtsId: Number(parameters['wtsId']),
            ctrId: Number(parameters['ctrId'])
          }
        ]
      };
      this.workorderService.saveCacheWorkorder(workorder);
      this.router.navigate(["/home/workorder/"+workorder.id.toString()+"/cr"]);
    }
    
  }
}
