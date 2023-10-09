import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { from } from 'rxjs/internal/observable/from';
import { Router } from '@angular/router';
import { SynthesisButton } from '../synthesis.drawer';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { CacheService } from 'src/app/core/services/cache.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { ReferenceDisplayType, UserReference } from 'src/app/core/models/layer.model';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { firstValueFrom } from 'rxjs';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { Workorder } from 'src/app/core/models/workorder.model';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.drawer.html',
  styleUrls: ['./equipment.drawer.scss'],
})
export class EquipmentDrawer implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private layerReferencesService: LayerService,
    private utils: UtilsService,
    private drawer: DrawerService,
    private cacheService: CacheService,
    private userService: UserService,
    private workorderService: WorkorderService,
    private layerService: LayerService,
    private mapLayerService: MapLayerService,
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
      disabledFunction: () => !this.userHasPermissionCreateAssetWorkorder,
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
    from(
      this.layerReferencesService.getUserReferences(feature.lyrTableName)
    ).subscribe(async (refs: UserReference[]) => {
      const currentLayer = (
        await this.cacheService.getObjectFromCache('referentials', 'layers')
      ).data.find((l) => l.lyrTableName === `${feature.lyrTableName}`);
      this.assetLabel = `${currentLayer.domLLabel} - ${currentLayer.lyrSlabel}`;
      this.userReferences = refs;
      this.equipment = feature;
    });
  }
}
