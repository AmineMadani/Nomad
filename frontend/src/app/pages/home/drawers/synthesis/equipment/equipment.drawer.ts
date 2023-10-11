import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { from } from 'rxjs/internal/observable/from';
import { Router } from '@angular/router';
import { SynthesisButton } from '../synthesis.drawer';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { ReferenceDisplayType, UserReference } from 'src/app/core/models/layer.model';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { firstValueFrom } from 'rxjs';
import { Workorder } from 'src/app/core/models/workorder.model';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.drawer.html',
  styleUrls: ['./equipment.drawer.scss'],
})
export class EquipmentDrawer implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private layerService: LayerService,
    private utils: UtilsService,
    private drawer: DrawerService,
    private userService: UserService,
    private workorderService: WorkorderService,
    private utilsService: UtilsService
  ) { }

  public buttons: SynthesisButton[] = [
    {
      key: 'create',
      label: 'Générer une intervention',
      icon: 'person-circle',
      disabledFunction: () => !this.userHasPermissionCreateAssetWorkorder,
    },
    {
      key: 'report',
      label: 'Saisir un compte rendu',
      icon: 'newspaper-outline',
      disabledFunction: () => !(this.userHasPermissionCreateAssetWorkorder && !this.utilsService.isMobilePlateform()),
    }
  ];

  // Permissions
  public userHasPermissionViewAssetDetailled: boolean = false;
  public userHasPermissionCreateAssetWorkorder: boolean = false;

  public userReferences: UserReference[] = [];
  public equipment: any;
  public isMobile: boolean;
  public assetLabel: string;
  public ReferenceDisplayType = ReferenceDisplayType;

  private ngUnsubscribe$: Subject<void> = new Subject();

  async ngOnInit(): Promise<void> {
    this.isMobile = this.utils.isMobilePlateform();
    this.userHasPermissionViewAssetDetailled =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.VIEW_ASSET_DETAILLED);
    this.userHasPermissionCreateAssetWorkorder =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.CREATE_ASSET_WORKORDER);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public async onTabButtonClicked(ev: SynthesisButton) {
    if (ev.key === 'create') {
      // Mono-equipment
      const { id, ...eq } = this.equipment;
      this.router.navigate(['/home/workorder'], {
        queryParams: { [this.equipment.lyrTableName]: this.equipment.id },
      });
    } else if (ev.key === 'report') {

      let lStatus  =  await firstValueFrom(this.workorderService.getAllWorkorderTaskStatus());

      let workorder: Workorder = {
        latitude: this.equipment.y,
        longitude: this.equipment.x,
        wtsId: lStatus.find(status => status.wtsCode == 'CREE')?.id,
        ctyId: this.equipment.ctyId,
        id: this.utilsService.createCacheId(),
        isDraft: true,
        tasks: [
          {
            id: this.utilsService.createCacheId(),
            latitude: this.equipment.y,
            longitude: this.equipment.x,
            assObjTable: this.equipment.lyrTableName,
            assObjRef: this.equipment.id,
            wtsId: lStatus.find(status => status.wtsCode == 'CREE')?.id,
            ctrId: this.equipment.ctrId
          }
        ]
      };
      this.workorderService.saveCacheWorkorder(workorder);
      this.router.navigate(["/home/workorder/"+workorder.id.toString()+"/cr"]);
    }
  }

  public onNavigateToDetails(): void {
    this.drawer.navigateTo(
      DrawerRouteEnum.EQUIPMENT_DETAILS,
      [this.equipment.id],
      this.equipment
    );
  }

  public onInitEquipment(feature: any) {
    from(this.layerService.getUserReferences(feature.lyrTableName))
      .pipe(
        switchMap((refs: UserReference[]) => {
          this.userReferences = refs;
          this.equipment = feature;

          return this.layerService.getAllLayers().pipe(
            map((layers) => layers.find((l) => l.lyrTableName === `${feature.lyrTableName}`))
          );
        })
      )
      .subscribe((currentLayer) => {
        this.assetLabel = `${currentLayer.domLLabel} - ${currentLayer.lyrSlabel}`;
      });
  }
}
