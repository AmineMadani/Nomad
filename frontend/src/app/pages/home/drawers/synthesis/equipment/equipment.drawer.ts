import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SynthesisButton } from '../synthesis.drawer';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { LayerService } from 'src/app/core/services/layer.service';
import { Layer, ReferenceDisplayType, UserReference } from 'src/app/core/models/layer.model';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { filter, firstValueFrom, takeUntil } from 'rxjs';
import { Workorder } from 'src/app/core/models/workorder.model';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { MapService } from 'src/app/core/services/map/map.service';

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
    private utilsService: UtilsService,
    private mapLayerService: MapLayerService,
    private route: ActivatedRoute,
    private mapService: MapService
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

    // We need to wait for the map to be loaded
    // Else we can't use the zoom and specific map functionnalities
    this.mapService.onMapLoaded().pipe(
      filter((isMapLoaded) => isMapLoaded),
      takeUntil(this.ngUnsubscribe$)
    ).subscribe(async () => {
      // Get the lyrTableName from the request param
      const urlParams = new URLSearchParams(window.location.search);
      const requestParamMap = new Map(urlParams.entries());
      const lyrTableName: string = requestParamMap.get('lyrTableName');
      // Get the equipmentId from the route params
      const routeParamMap: Params = await firstValueFrom(this.route.params);
      const equipmentId: string = routeParamMap['id'];

      // Init equipment with the params when the map loaded
      this.initEquipment(lyrTableName, equipmentId);
    });
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

      let lStatus = await this.workorderService.getAllWorkorderTaskStatus();

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

  private async initEquipment(lyrTableName: string, equipmentId: string): Promise<void> {
    // Start by getting the equipment wit layer and id
    const equipment =
      await this.layerService.getEquipmentByLayerAndId(lyrTableName, equipmentId);

    await this.zoomToEquipment(lyrTableName, equipment);

    // Set current equipment with the lyrTableName find in the url.
    this.equipment = {
      ...equipment,
      lyrTableName: lyrTableName,
    };

    // Get the user references with the lyrTableName of the equipment
    this.userReferences = await this.layerService.getUserReferences(this.equipment.lyrTableName);

    // Get asset label by current layer info
    const layers = await this.layerService.getAllLayers();
    const currentLayer = layers.find((l) => l.lyrTableName === `${this.equipment.lyrTableName}`);
    this.assetLabel = `${currentLayer.domLLabel} - ${currentLayer.lyrSlabel}`;
  }

  private async zoomToEquipment(lyrTableName: string, equipment: any) {
    const layer: Layer = await this.layerService.getLayerByKey(lyrTableName);
    const minZoom = (JSON.parse(layer.listStyle[0].sydDefinition)[0].minzoom) + 1;
    await this.mapLayerService.moveToXY(equipment.x, equipment.y, minZoom);
    await this.mapLayerService.zoomOnXyToFeatureByIdAndLayerKey(
      lyrTableName,
      equipment.id
    );
  }
}
