import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { DrawingService } from 'src/app/core/services/map/drawing.service';
import { IonModal, IonPopover, ModalController } from '@ionic/angular';
import { MapService } from 'src/app/core/services/map/map.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import * as Maplibregl from 'maplibre-gl';
import { LayerService } from 'src/app/core/services/layer.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { Router } from '@angular/router';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import {
  Workorder,
  WorkorderTaskReason,
} from 'src/app/core/models/workorder.model';
import { UtilsService } from 'src/app/core/services/utils.service';
import { Layer } from 'src/app/core/models/layer.model';
import { StreetViewModalComponent } from 'src/app/shared/components/street-view-modal/street-view-modal.component';
import { Subject, takeUntil } from 'rxjs';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { SearchAssets } from 'src/app/core/models/asset.model';

@Component({
  selector: 'app-map-context-menu',
  templateUrl: './map-context-menu.component.html',
  styleUrls: ['./map-context-menu.component.scss'],
})
export class MapContextMenuComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private drawingService: DrawingService,
    private mapService: MapService,
    private userService: UserService,
    private layerService: LayerService,
    private drawerService: DrawerService,
    private router: Router,
    private workorderService: WorkorderService,
    private mapLayerService: MapLayerService,
    private utilsService: UtilsService,
    private modalCtrl: ModalController,
    private mapEvent: MapEventService
  ) {
    this.isMobile = this.utilsService.isMobilePlateform();
  }

  @Input() mapFeatures: Maplibregl.MapGeoJSONFeature[];
  @Input() clickEvent: Maplibregl.MapMouseEvent;

  @ViewChild('assetSelectionPopover', { static: true })
  assetSelectionPopover: IonPopover;
  @ViewChild('wkoSelectionPopover', { static: true })
  wkoSelectionPopover: IonPopover;
  @ViewChild('criSelectionPopover', { static: true })
  criSelectionPopover: IonPopover;
  @ViewChild('taskSelectionPopover', { static: true })
  taskSelectionPopover: IonPopover;
  @ViewChild('ionModalStreetView', { static: false })
  ionModalStreetView: IonModal;

  @HostListener('document:click')
  clickout() {
    if (!this.isInsideContextMenu) {
      this.isContextMenuOpened = false;
    }
  }
  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
    if (this.streetViewMarker) {
      this.streetViewMarker.remove();
      this.ionModalStreetView.isOpen = false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.inititialized && this.mapFeatures) {
      this.UpdateContextMenuItems();
    }
  }

  async ngOnInit() {
    // Init permissions
    this.userHasPermissionCreateXYWorkorder =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.CREATE_X_Y_WORKORDER
      );
    this.userHasPermissionModifyReport =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.MODIFY_REPORT_MY_AREA
      );
    Promise.all([
      this.layerService.getAllLayers(),
      this.workorderService.getAllWorkorderTaskReasons(),
    ]).then((res: [Layer[], WorkorderTaskReason[]]) => {
      this.layers = res[0];
      this.taskReason = res[1];
    });
    if (this.isMobile) {
      this.mapEvent
        .onStreetViewSelected()
        .pipe(takeUntil(this.ngUnsubscribe$))
        .subscribe(() => {
          this.onMobileStreetView();
        });
    }
    this.inititialized = true;
  }

  // Permissions
  public userHasPermissionCreateXYWorkorder: boolean = false;
  public userHasPermissionModifyReport: boolean = false;
  public isInsideContextMenu: boolean = false;
  public assets: any[] = [];
  public tasks: any[] = [];
  public selectedAsset: any = undefined;
  public isAssetSelectionOpened: boolean = false;
  public isWkoSelectionOpened: boolean = false;
  public isReportSelectionOpened: boolean = false;
  public isTaskSelectionOpened: boolean = false;
  public layers = [];
  public taskReason: WorkorderTaskReason[];
  public isMobile: boolean;
  public streetViewMarker: Maplibregl.Marker;
  public isContextMenuOpened: boolean

  private clicklatitude: number;
  private clicklongitude: number;
  private inititialized: boolean = false;
  private ngUnsubscribe$: Subject<void> = new Subject();

  public onBlur() {
    // this.isContextMenuOpened = false;
  }

  /**
   * Change the param isInsideContextMenu if hte user is on/out of the context menu
   * @param hover True if context menu hover
   */
  public onHoverContextMenu(hover: boolean) {
    this.isInsideContextMenu =
      hover ||
      this.isAssetSelectionOpened ||
      this.isReportSelectionOpened ||
      this.isTaskSelectionOpened ||
      this.isWkoSelectionOpened;
  }

  /**
   * Use the polygon drawing tool of MapboxDraw, with their input hidden
   */
  public onPolygonalSelection(): void {
    this.closeMenu();
    this.drawingService.setDrawMode('draw_polygon');
  }

  /**
   * Use the polygon drawing tool of MapboxDraw, with their input hidden
   */
  public onRectangleSelection(): void {
    this.drawingService.setDrawMode('draw_rectangle');
    this.closeMenu();
  }

  /**
   * Asks the user how they want to share their location then
   * copies the appropriate information to the clipboard.
   */
  public async onShareLocalisation(): Promise<void> {
    this.closeMenu();
    await this.mapService.sharePosition(
      'home',
      this.clicklatitude,
      this.clicklongitude
    );
  }

  /**
   * Methode to navigate to the synthetic view ao an asset
   * @param asset
   */
  public selectAsset(asset: any): void {
    this.selectedAsset = asset;
    this.assetSelectionPopover.dismiss();
    this.closeMenu();

    this.drawerService.navigateTo(DrawerRouteEnum.ASSET, [asset['id']], {
      lyrTableName: asset.source,
    });
  }

  /**
   * Retreive the feature near the click position and open the contextual menu
   */
  public async UpdateContextMenuItems(): Promise<void> {
    this.clicklatitude = this.clickEvent.lngLat.lat;
    this.clicklongitude = this.clickEvent.lngLat.lng;
    if (this.mapFeatures instanceof Array) {
      this.assets = this.mapFeatures
        .filter((f) => !f.layer.source.toLowerCase().includes('task'))
        .filter((element, index, array) => {
          return (
            array.findIndex((obj) => obj['id'] === element['id']) === index
          );
        });
    } else {
      this.assets = [];
    }
    this.tasks = this.mapFeatures.filter((f) =>
      f.layer.source.toLowerCase().includes('task')
    );

    this.assets.forEach((element: any) => {
      element.assetName = this.layers.find(
        (l) => l.lyrTableName === element.source
      ).lyrSlabel;
    });
    if (this.assets.length === 1) {
      this.selectedAsset = this.assets[0];
    }

    this.tasks = await this.getFeaturesInClusterView('task', this.tasks);
    this.tasks = this.tasks.filter((f) => !f.properties?.['cluster']);
    this.tasks = this.tasks.filter((element, index, array) => {
      return array.findIndex((obj) => obj['id'] === element['id']) === index;
    });
    this.tasks.forEach((task: any) => {
      const reason = this.taskReason.find((r) => task.properties.wtrId == r.id);
      task.reason = reason?.wtrSlabel;
    });
    this.isContextMenuOpened = true;
  }

  /**
   * Get the features from a cluster
   * @param layerKey the layer of the cluster
   * @param f liste af feature
   * @returns
   */
  public getFeaturesInClusterView(
    layerKey: string = 'task',
    f: Maplibregl.MapGeoJSONFeature[]
  ): Promise<Maplibregl.MapGeoJSONFeature[]> {
    return new Promise((resolve, reject) => {
      if (
        this.mapService.getMap('home') &&
        this.mapService.getMap('home').getLayer(layerKey.toUpperCase())
      ) {
        const promises: Promise<any>[] = [];

        for (const feature of f) {
          if (feature.properties?.['cluster']) {
            const clusterId = feature.properties['cluster_id'];
            const pointCount = feature.properties['point_count'];

            const promise = new Promise<void>(
              (clusterResolve, clusterReject) => {
                // Get the children of the cluster. The any is important because the Maplibre Source type is done badly
                (
                  this.mapService.getMap('home').getSource(layerKey) as any
                ).getClusterLeaves(
                  clusterId,
                  pointCount,
                  0,
                  function (error, features) {
                    if (error) {
                      clusterReject(error);
                    } else {
                      if (features?.length > 0) {
                        f = [...f, ...features];
                      }
                      clusterResolve();
                    }
                  }
                );
              }
            );
            promises.push(promise);
          }
        }

        // Resolve the promises for every cluster
        Promise.all(promises)
          .then(() => {
            resolve(f);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        // If there were no cluster, resolve the first queryRenderedFeatures
        resolve(f);
      }
    });
  }

  /**
   * Navigates to a work order page with selected feature properties as query parameters or none for XY workorder
   */
  public onGenerateWorkOrder(feature: any | null): void {
    this.wkoSelectionPopover.dismiss();
    this.closeMenu();
    if (feature?.id) {
      const searchAssets: SearchAssets[] = [
        {
          lyrTableName: feature.source,
          assetIds: [feature.id]
        }
      ];
      // Mono-asset
      this.drawerService.navigateWithAssets({
        route: DrawerRouteEnum.WORKORDER_CREATION,
        assets: searchAssets,
      });
    } else {
      this.drawerService.navigateTo(
        DrawerRouteEnum.WORKORDER_WATER_TYPE,
        undefined,
        {
          x: this.clickEvent.lngLat.lng,
          y: this.clickEvent.lngLat.lat,
        }
      );
    }
  }

  /**
   * Open the "compte rendu" drawer . XY if no asset was selected
   */
  public async onGenerateReport(asset: any | null): Promise<void> {
    this.closeMenu();
    this.criSelectionPopover.dismiss();
    let lStatus = await this.workorderService.getAllWorkorderTaskStatus();
    let ctrId = asset && asset.ctrId ? asset.ctrId : null;

    if (asset === null) {
      let selectedFeature: Maplibregl.MapGeoJSONFeature & any = {
        properties: {
          x: this.clickEvent.lngLat.lng,
          y: this.clickEvent.lngLat.lat,
          ctrId: ctrId,
          target: 'report',
          wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
        },
      };

      this.drawerService.navigateTo(
        DrawerRouteEnum.WORKORDER_WATER_TYPE,
        undefined,
        selectedFeature['properties']
      );
    } else if (asset.id) {
      const assetDetails = await this.layerService.getAssetByLayerAndId(
        asset['source'],
        asset['id']
      );
      let recalculateCoords: number[];
      //Assets have fixed coordinates
      if (assetDetails.geom.type == 'Point') {
        recalculateCoords = [
          asset['properties']['x'],
          asset['properties']['y'],
        ];
      } else {
        recalculateCoords = this.mapLayerService.findNearestPoint(
          assetDetails.geom.coordinates,
          [asset['properties']['x'], asset['properties']['y']]
        );
      }
      let workorder: Workorder = {
        latitude: recalculateCoords[1],
        longitude: recalculateCoords[0],
        wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
        ctyId: asset['properties']['ctyId'],
        id: this.utilsService.createCacheId(),
        isDraft: true,
        tasks: [
          {
            id: this.utilsService.createCacheId(),
            latitude: recalculateCoords[1],
            longitude: recalculateCoords[0],
            assObjTable: asset['source'] ? asset['source'] : 'aep_xy',
            assObjRef: asset['id'] ? asset['id'] : null,
            wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
            ctrId: ctrId,
          },
        ],
      };
      this.workorderService.saveCacheWorkorder(workorder);
      this.closeMenu();
      this.router.navigate([
        '/home/workorder/' + workorder.id.toString() + '/cr',
      ]);
    }
  }
  /**
   * Open the task drawer
   */
  public onOpenTask(task: any): void {
    this.closeMenu();
    this.taskSelectionPopover.dismiss();
    this.router.navigate([
      '/home/workorder/' + task.properties.wkoId + '/task/' + task.id,
    ]);
  }

  /**
   * Opens the modal with Google Street View, passing in longitude and
   * latitude coordinates as component props.
   * @param {number} lng - The longitude coordinate of the location for the street view.
   * @param {number} lat - The latitude coordinate of the location for the street view.
   */
  public async onStreetView(
    lng: number = this.clicklongitude,
    lat: number = this.clicklatitude
  ): Promise<void> {
    if (this.isMobile) {
      this.ionModalStreetView.isOpen = false;
      this.streetViewMarker.remove();
      this.streetViewMarker = undefined;
    }
    const modal = await this.modalCtrl.create({
      component: StreetViewModalComponent,
      componentProps: {
        lng,
        lat,
      },
      backdropDismiss: false,
      cssClass: this.isMobile ? '' : 'large-modal',
    });

    modal.present();
  }

  /**
   * Sets a draggable marker on the map at the center position and opens the validation/cancel
   * bottom sheet for the marker
   */
  public async onMobileStreetView(): Promise<void> {
    const centerMapPosition = this.mapService.getMap('home').getCenter();
    this.streetViewMarker = new Maplibregl.Marker({
      draggable: true,
    })
      .setLngLat([centerMapPosition.lng, centerMapPosition.lat])
      .addTo(this.mapService.getMap('home'));
    this.ionModalStreetView.isOpen = true;
  }

  /**
   * Close the context menu
   */
  private closeMenu() {
    this.isContextMenuOpened = false;
  }
}
