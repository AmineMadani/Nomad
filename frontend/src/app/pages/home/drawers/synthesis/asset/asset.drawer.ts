import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { SynthesisButton } from '../synthesis.drawer';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { LayerService } from 'src/app/core/services/layer.service';
import {
  Layer,
  ReferenceDisplayType,
  UserReference,
} from 'src/app/core/models/layer.model';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { filter, firstValueFrom, takeUntil } from 'rxjs';
import { Workorder } from 'src/app/core/models/workorder.model';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { MapService } from 'src/app/core/services/map/map.service';
import { DateValidator } from 'src/app/shared/form-editor/validators/date.validator';
import { SearchAssets } from 'src/app/core/models/asset.model';

@Component({
  selector: 'app-asset',
  templateUrl: './asset.drawer.html',
  styleUrls: ['./asset.drawer.scss'],
})
export class AssetDrawer implements OnInit, OnDestroy {
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
  ) {}

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
      disabledFunction: () =>
        !(
          this.userHasPermissionCreateAssetWorkorder &&
          !this.utilsService.isMobilePlateform()
        ),
    },
  ];

  // Permissions
  public userHasPermissionViewAssetDetailled: boolean = false;
  public userHasPermissionCreateAssetWorkorder: boolean = false;

  public userReferences: UserReference[] = [];
  public asset: any;
  public isMobile: boolean;
  public assetLabel: string;
  public ReferenceDisplayType = ReferenceDisplayType;

  private ngUnsubscribe$: Subject<void> = new Subject();

  async ngOnInit(): Promise<void> {
    this.isMobile = this.utils.isMobilePlateform();
    this.userHasPermissionViewAssetDetailled =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.VIEW_ASSET_DETAILLED
      );
    this.userHasPermissionCreateAssetWorkorder =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.CREATE_ASSET_WORKORDER
      );

    // We need to wait for the map to be loaded
    // Else we can't use the zoom and specific map functionnalities
    this.mapService
      .onMapLoaded('home')
      .pipe(
        filter((isMapLoaded) => isMapLoaded),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(async () => {
        await this.prepareInitAsset();
      });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(async () => {
        await this.prepareInitAsset();
      });
  }

  private async prepareInitAsset() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestParamMap = new Map(urlParams.entries());
    const lyrTableName: string = requestParamMap.get('lyrTableName');
    // Get the assetId from the route params
    const routeParamMap: Params = await firstValueFrom(this.route.params);
    const assetId: string = routeParamMap['id'];
    // Init asset with the params when the map loaded
    this.initAsset(lyrTableName, assetId);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public async onTabButtonClicked(ev: SynthesisButton) {
    if (ev.key === 'create') {
      const searchAssets: SearchAssets[] = [
        {
          lyrTableName: this.asset.lyrTableName,
          assetIds: [this.asset.id]
        }
      ];
      // Mono-asset
      this.drawer.navigateWithAssets({
        route: DrawerRouteEnum.WORKORDER_CREATION,
        assets: searchAssets,
      });
    } else if (ev.key === 'report') {
      let lStatus = await this.workorderService.getAllWorkorderTaskStatus();

      if (this.asset.geom && this.asset.geom.type !== 'Point') {
        const recalculateCoords = this.mapLayerService.findNearestPoint(
          this.asset.geom.coordinates,
          [this.asset.x, this.asset.y]
        );

        this.asset.x = recalculateCoords[0];
        this.asset.y = recalculateCoords[1];
      }

      let workorder: Workorder = {
        latitude: this.asset.y,
        longitude: this.asset.x,
        wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
        ctyId: this.asset.ctyId,
        id: this.utilsService.createCacheId(),
        isDraft: true,
        tasks: [
          {
            id: this.utilsService.createCacheId(),
            latitude: this.asset.y,
            longitude: this.asset.x,
            assObjTable: this.asset.lyrTableName,
            assObjRef: this.asset.id,
            wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
            ctrId: this.asset.ctrId,
          },
        ],
      };
      this.workorderService.saveCacheWorkorder(workorder);
      this.router.navigate([
        '/home/workorder/' + workorder.id.toString() + '/cr',
      ]);
    }
  }

  public onNavigateToDetails(): void {
    // Create a copy of asset without null values
    const assetNoNull = { ...this.asset };

    Object.keys(assetNoNull).forEach(key => {
      if (assetNoNull[key] === null) {
        assetNoNull[key] = '';
      }
    });
    this.drawer.navigateTo(
      DrawerRouteEnum.ASSET_DETAILS,
      [this.asset.id],
      assetNoNull
    );
  }


  private async initAsset(
    lyrTableName: string,
    assetId: string
  ): Promise<void> {
    // Start by getting the asset wit layer and id
    const asset = await this.layerService.getAssetByLayerAndId(
      lyrTableName,
      assetId
    );

    await this.zoomToAsset(lyrTableName, asset);

    // Set current asset with the lyrTableName find in the url.
    this.asset = {
      ...asset,
      lyrTableName: lyrTableName,
    };

    // Get the user references with the lyrTableName of the asset
    this.userReferences = await this.layerService.getUserReferences(
      this.asset.lyrTableName
    );

    // Get asset label by current layer info
    const layers = await this.layerService.getAllLayers();
    const currentLayer = layers.find(
      (l) => l.lyrTableName === `${this.asset.lyrTableName}`
    );
    this.assetLabel = `${currentLayer.domLLabel} - ${currentLayer.lyrSlabel}`;
  }

  private async zoomToAsset(lyrTableName: string, asset: any) {
    const layer: Layer = await this.layerService.getLayerByKey(lyrTableName);
    const minZoom = JSON.parse(layer.listStyle[0].sydDefinition)[0].minzoom + 1;
    await this.mapLayerService.moveToXY('home', asset.x, asset.y, minZoom);
    await this.mapLayerService.zoomOnXyToFeatureByIdAndLayerKey(
      'home',
      lyrTableName,
      asset.id
    );
  }

  /**
   * Convert to format date if it's date
   * @param value
   * @returns
   */
  public getAssetValue(value : string){
    let result = value?.toString();
    if (result && DateValidator.isDate(result)) {
      result = DateValidator.convertFormatDateFr(result);
    }
    return result;
  }

}
