import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SynthesisButton } from '../synthesis.drawer';
import { ActivatedRoute, Router } from '@angular/router';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { MapService } from 'src/app/core/services/map/map.service';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { Subject, takeUntil, filter, debounceTime } from 'rxjs';
import { Layer, SearchEquipments } from 'src/app/core/models/layer.model';
import { UtilsService } from 'src/app/core/services/utils.service';
import { IonContent, IonPopover } from '@ionic/angular';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { Workorder } from 'src/app/core/models/workorder.model';
import { DrawingService } from 'src/app/core/services/map/drawing.service';
import { AssetForSigService } from 'src/app/core/services/assetForSig.service';
import { LocationStrategy } from '@angular/common';

@Component({
  selector: 'app-multiple-selection',
  templateUrl: './multiple-selection.drawer.html',
  styleUrls: ['./multiple-selection.drawer.scss'],
})
export class MultipleSelectionDrawer implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private layerService: LayerService,
    private mapService: MapService,
    private mapLayerService: MapLayerService,
    private drawerService: DrawerService,
    private mapEventService: MapEventService,
    private utilsService: UtilsService,
    private userService: UserService,
    private workorderService: WorkorderService,
    private drawingService: DrawingService,
    private assetForSigService: AssetForSigService,
    private location: LocationStrategy,
  ) {
  }

  @ViewChild('popover', { static: true }) popover: IonPopover;
  @ViewChild('popoverButtons', { static: true }) popoverButtons: IonPopover;
  @ViewChild(IonContent, { static: false }) ionContent: IonContent;

  public buttons: SynthesisButton[] = [];

  public featuresSelected: any[] = [];
  public filteredFeatures: any[] = [];
  public sources: { key: string; label: string }[] = [];
  public selectedSource: any;
  public isLoading: boolean = false;
  public isMobile: boolean;
  public addToSelection: boolean = false;
  public updateUrl: boolean = false;
  public wkoDraft: number;
  public featureIdSelected: string = '';
  public featuresHighlighted: any[] = [];
  public userHasPermissionCreateAssetWorkorder: boolean = false;
  public userHasPermissionRequestUpdateAsset: boolean = false;
  public numberOfButtonDisplayed: number = 4;

  private layersConf: Layer[] = [];
  private ngUnsubscribe$: Subject<void> = new Subject();
  private step: string;
  private nbItemsPerPage: number = 20;
  private nbDisplayedTask: number = 20;

  async ngOnInit() {
    this.wkoDraft = this.activatedRoute.snapshot.queryParams?.['draft'];
    this.step = this.activatedRoute.snapshot.queryParams?.['step'];
    this.buttons = [
      { key: 'add', label: 'Ajouter un élement', icon: 'add-outline' },
      {
        key: 'create',
        label: this.wkoDraft
          ? this.step == 'report'
            ? 'Reprendre le CR'
            : "Reprendre l'intervention"
          : 'Générer une intervention',
        icon: 'person-circle-outline',
        disabledFunction: () =>
          !this.userHasPermissionCreateAssetWorkorder ||
          this.filteredFeatures.length === 0,
      },
      {
        key: 'report',
        label: 'Saisir un compte rendu',
        icon: 'newspaper-outline',
        disabledFunction: () =>
          !this.userHasPermissionCreateAssetWorkorder ||
          this.filteredFeatures.length === 0,
      },
      {
        key: 'new-asset',
        label: 'Créer un patrimoine',
        icon: 'refresh-outline',
        disabledFunction: () => !this.userHasPermissionRequestUpdateAsset,
      },
      {
        key: 'showSelectedFeatures',
        label: 'Afficher toutes les sélections',
        icon: 'locate-outline',
      },
      //{ key: 'generate-itv', label: 'Exporter ITV vierge', icon: 'download-outline' },
    ];
    this.isMobile = this.utilsService.isMobilePlateform();

    // Permissions
    this.userHasPermissionCreateAssetWorkorder =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.CREATE_ASSET_WORKORDER
      );
    this.userHasPermissionRequestUpdateAsset =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.REQUEST_UPDATE_ASSET
      );

    // Get equipments send from the state
    const state = this.location.getState();
    const searchedEquipments: SearchEquipments[] = state['equipments'];
    // Launch the first equipments data recuperation
    await this.getEquipmentsData(searchedEquipments);

    this.mapEventService
      .onFeatureHovered()
      .pipe(debounceTime(300), takeUntil(this.ngUnsubscribe$))
      .subscribe((f: string) => {
        if (f) {
          this.featureIdSelected = f;
          const name = 'feature-container-' + this.featureIdSelected;
          if (!this.getDisplayedFeatures().some((ftr) => ftr.id === this.featureIdSelected)) {
            const featureToAddIndex = this.filteredFeatures.findIndex((ftr) => ftr.id === f);
            if (featureToAddIndex > -1) {
              // Move the features to a position in the displayed features
              const element = this.filteredFeatures[featureToAddIndex];
              this.filteredFeatures.splice(featureToAddIndex, 1);
              this.filteredFeatures.splice(Math.round(this.nbDisplayedTask / 2), 0, element);
            }
          }

          setTimeout(() => {
            document.getElementById(name)?.scrollIntoView({ behavior: 'smooth' });
          });
        } else {
          this.featureIdSelected = undefined;
        }
      });

    this.mapEventService
      .onFeatureSelected()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(async (feature) => {
        await this.addNewFeatures(feature);
      });

    this.mapEventService
      .onMultiFeaturesSelected()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(async (features) => {
        await this.addNewFeatures(features);
      });
  }

  public getDisplayedFeatures(): any[] {
    return this.filteredFeatures.slice(0, this.nbDisplayedTask);
  }

  public onScroll(event: any): void {
    const element = event.target;
    const atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;

    if (atBottom) {
      // User has scrolled to the bottom of the element
      this.nbDisplayedTask += this.nbItemsPerPage;
    }
  }

  private async getEquipmentsData(searchedEquipments: SearchEquipments[]) {
    // Reset user selection values
    this.featuresSelected = [];
    this.filteredFeatures = [];
    this.sources = [];
    this.layersConf = [];
    this.featuresHighlighted = [];

    // Get equipments data
    const features = await this.layerService.getEquipmentsByLayersAndIds(
      searchedEquipments.filter((asset) => asset.lyrTableName.startsWith('aep_') || asset.lyrTableName.startsWith('ass_'))
    );

    // When we come from an xy we don't have features
    if (features && features.length > 0) {
      // Zoom to fit the screen with all equipments
      // Only when the map loaded to remove some problems when we refresh the screen
      this.mapService
        .onMapLoaded('home')
        .pipe(
          filter((isMapLoaded) => isMapLoaded),
          takeUntil(this.ngUnsubscribe$)
        )
        .subscribe(() => {
          this.mapLayerService.fitBounds(
            'home',
            features.map((f) => {
              return [+f.x, +f.y];
            })
          );
        });

      // Add the lyrTableName for each equipments
      const equipments = features.map((f) => {
        return {
          ...f,
          lyrTableName: searchedEquipments.find((map) =>
            map.equipmentIds.includes(f.id)
          ).lyrTableName,
        };
      });

      await this.addLayerToMap(equipments);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public trackByFn(index: number, feature: any): number {
    return feature.id;
  }

  public async onTabButtonClicked(e: SynthesisButton): Promise<void> {
    switch (e.key) {
      case 'add':
        this.popover.present();
        break;
      case 'create':
        if (this.wkoDraft) {
          if (this.step == 'report') {
            this.drawerService.navigateTo(DrawerRouteEnum.REPORT, [
              this.wkoDraft,
            ]);
          } else {
            this.drawerService.navigateTo(DrawerRouteEnum.WORKORDER_EDITION, [
              this.wkoDraft,
            ]);
          }
        } else {
          this.drawerService.navigateWithEquipments(
            DrawerRouteEnum.WORKORDER_CREATION,
            this.utilsService.transformFeaturesIntoSearchEquipments(this.filteredFeatures)
          );
        }

        break;
      case 'report':
        const { filtred, filtredAssets } =
          await this.layerService.checkEquipments(this.filteredFeatures);
        if (filtred) {
          if (!filtredAssets || filtredAssets?.length === 0) {
            return;
          }
          this.filteredFeatures = filtredAssets;
        }
        let lStatus = await this.workorderService.getAllWorkorderTaskStatus();
        let workorder: Workorder = {
          id: this.utilsService.createCacheId(),
          isDraft: true,
          wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
          tasks: [],
        };
        workorder.tasks = [
          ...workorder.tasks,
          ...this.filteredFeatures.map((feature) => {
            if (feature.geom && feature.geom.type !== 'Point') {
              const recalculateCoords = this.mapLayerService.findNearestPoint(
                feature.geom.coordinates,
                [feature.x, feature.y]
              );

              feature.x = recalculateCoords[0];
              feature.y = recalculateCoords[1];
            }

            return {
              id: this.utilsService.createCacheId(),
              latitude: feature.y,
              longitude: feature.x,
              assObjTable: feature.lyrTableName,
              assObjRef: feature.id,
              wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
              ctrId: feature.ctrId,
            }
          })
        ];
        this.workorderService.saveCacheWorkorder(workorder);
        this.router.navigate([
          '/home/workorder/' + workorder.id.toString() + '/cr',
        ]);
        break;
      case 'new-asset':
        if (this.wkoDraft) {
          this.drawerService.navigateTo(DrawerRouteEnum.NEW_ASSET, [], {
            draft: this.wkoDraft,
          });
        } else {
          this.drawerService.navigateWithEquipments(
            DrawerRouteEnum.NEW_ASSET,
            this.utilsService.transformFeaturesIntoSearchEquipments(this.filteredFeatures),
          );
        }
        break;
      case 'showSelectedFeatures':
        this.restoreViewOnFeatureSelected();
        break;
      default:
        break;
    }
  }

  public setAddMode(mode: string): void {
    this.mapEventService.isFeatureFiredEvent = true;
    switch (mode) {
      case 'polygon':
        this.drawingService.setDrawMode('draw_polygon');
        break;
      case 'rect':
        this.drawingService.setDrawMode('draw_rectangle');
        break;
      case 'unit':
        // this.mapService.setAddToSelection(true);
        break;
    }
    this.popover.dismiss();
  }

  public async handleChange(e: Event): Promise<void> {
    const event: CustomEvent = e as CustomEvent;
    if (event?.detail.value?.length > 0) {
      this.filteredFeatures = this.featuresSelected.filter((f) =>
        event.detail.value.includes(f.lyrTableName)
      );
    } else {
      this.selectedSource = undefined;
      this.filteredFeatures = this.featuresSelected;
    }

    if (this.wkoDraft) {
      const wko: Workorder = await this.workorderService.getWorkorderById(
        this.wkoDraft
      );

      // Step 1: Remove tasks with assObjRef not in filteredElements array
      wko.tasks = wko.tasks.filter((t) =>
        this.filteredFeatures.map((f) => f.id).includes(t.assObjRef)
      );

      // Step 2: Add tasks for filteredElements without corresponding tasks
      const tasksToAdd = this.filteredFeatures
        .filter((f) => !wko.tasks.some((t) => t.assObjRef === f.id))
        .map((f) => ({
          id: this.utilsService.createCacheId(),
          assObjTable: f.lyrTableName,
          assObjRef: f.id,
          latitude: f.y,
          longitude: f.x,
          wtrId: wko.tasks[0]?.wtrId ?? null,
          wtsId: wko.tasks[0]?.wtsId ?? null,
        }));

      wko.tasks.push(...tasksToAdd);

      await this.workorderService.saveCacheWorkorder(wko);
    }
  }

  public openFeature(feature: any): void {
    if (feature.isTemp === true) return;

    this.drawerService.navigateTo(DrawerRouteEnum.EQUIPMENT, [feature.id], {
      lyrTableName: feature.lyrTableName,
    });
  }

  public async removeFeature(e: Event, feature: any): Promise<void> {
    e.stopPropagation();

    if (this.featuresHighlighted.includes(feature)) {
      this.featuresHighlighted.splice(
        this.featuresHighlighted.findIndex((f) => f.id === feature.id),
        1
      );
    }

    this.featuresSelected.splice(
      this.featuresSelected.findIndex((f) => f.id === feature.id),
      1
    );

    if (this.filteredFeatures.includes(feature)) {
      this.filteredFeatures.splice(
        this.featuresSelected.findIndex((f) => f.id === feature.id),
        1
      );
    }

    if (this.wkoDraft) {
      const wko: Workorder = await this.workorderService.getWorkorderById(
        this.wkoDraft
      );
      wko.tasks = wko.tasks.filter((t) => t.assObjRef !== feature.id);
      await this.workorderService.saveCacheWorkorder(wko);
    }

    this.mapEventService.removeFeatureFromSelected(
      this.mapService.getMap('home'),
      feature.id
    );
  }

  public getLyrLabel(layerKey: string): string {
    return this.layersConf.find((l: Layer) => l.lyrTableName.includes(layerKey))
      ?.lyrSlabel;
  }

  public getDomLabel(layerKey: string): string {
    return this.layersConf.find((l: Layer) => l.lyrTableName.includes(layerKey))
      ?.domLLabel;
  }

  public generateFeatureParams(features: any[]): any {
    const featureParams: any = {};

    features.forEach((feature) => {
      const source = feature.lyrTableName || feature.source;

      if (!featureParams[source]) {
        featureParams[source] = new Set();
      }

      featureParams[source].add(feature.id);
    });

    // Convert the Sets to comma-separated strings
    Object.keys(featureParams).forEach((source) => {
      featureParams[source] = Array.from(featureParams[source]).join(',');
    });

    return featureParams;
  }

  public bounceToFeature(e: Event, feature: any) {
    e.stopPropagation();

    if (this.featuresHighlighted.includes(feature)) {
      this.featuresHighlighted = [];
      this.restoreViewOnFeatureSelected();
      this.hightlightFeatures();
    } else {
      this.featuresHighlighted.push(feature);
      this.hightlightFeatures(this.featuresHighlighted);
      this.mapLayerService.fitBounds(
        'home',
        this.featuresHighlighted.map((f) => {
          return [+f.x, +f.y];
        })
      );
    }
  }

  public restoreViewOnFeatureSelected() {
    this.featuresHighlighted = [];
    this.hightlightFeatures();
    this.mapLayerService.fitBounds(
      'home',
      this.featuresSelected.map((f) => {
        return [+f.x, +f.y];
      })
    );
  }

  public highlightSelectedFeature(feature: any): void {
    if (feature) {
      const features =
        this.featuresHighlighted.length > 0
          ? [feature, ...this.featuresHighlighted]
          : [feature];
      this.hightlightFeatures(features);
    } else {
      if (this.featuresHighlighted.length > 0) {
        this.hightlightFeatures(this.featuresHighlighted);
      } else {
        this.hightlightFeatures();
      }
    }
  }

  private async addLayerToMap(abstractFeatures: any[]): Promise<void> {
    this.isLoading = true;

    if (abstractFeatures == null) abstractFeatures = [];

    // Add tempory new asset
    if (this.wkoDraft != null) {
      // When there is a workorder
      const wko: Workorder = await this.workorderService.getWorkorderById(
        this.wkoDraft
      );
      const listTaskOnNewAsset = wko.tasks.filter((task) =>
        task.assObjRef?.startsWith('TMP-')
      );
      for (const task of listTaskOnNewAsset) {
        abstractFeatures.push({
          id: task.assObjRef,
          lyrTableName: task.assObjTable,
          x: task.longitude,
          y: task.latitude,
          isTemp: true,
        });
      }
    } else {
      // When there is no workorder, but there is a reference in the url param
      const state = this.location.getState();
      const searchedEquipments: SearchEquipments[] = state['equipments'];
      const tmpAssetType = searchedEquipments?.find((asset) => asset.lyrTableName === 'tmp');

      if (tmpAssetType) {
        for (const id of tmpAssetType.equipmentIds) {
          const assetForSig = await this.assetForSigService.getCacheAssetForSigByAssObjRef(id);
          if (assetForSig != null) {
            abstractFeatures.push({
              id: id,
              lyrTableName: assetForSig.assObjTable,
              x: assetForSig.coords[0][0],
              y: assetForSig.coords[0][1],
              isTemp: true,
            });
          }
        }
      }
    }

    const promises: Promise<void>[] = abstractFeatures.map(
      ({ lyrTableName }) => {
        return this.mapService.addEventLayer('home', lyrTableName);
      }
    );

    await Promise.all(promises);

    this.sources = [
      ...new Set(abstractFeatures.map(({ lyrTableName }) => lyrTableName)),
    ].map((lyrName: string) => {
      const conf = this.mapService.getLayer(lyrName).configurations;
      this.layersConf.push(conf);
      return { key: lyrName, label: conf.lyrSlabel };
    });

    const mapSearch: Map<string, string[]> = new Map();
    for (const feature of abstractFeatures) {
      if (feature.isTemp) {
        this.featuresSelected.push(feature);
      } else {
        if (mapSearch.get(feature.lyrTableName)) {
          mapSearch.get(feature.lyrTableName).push(feature.id);
        } else {
          mapSearch.set(feature.lyrTableName, [feature.id]);
        }
      }
    }

    const searchEquipments: SearchEquipments[] = [];
    for (const [key, value] of mapSearch) {
      searchEquipments.push({
        lyrTableName: key,
        equipmentIds: value,
        allColumn: true,
      });
    }

    const searchEquipmentsRes =
      await this.layerService.getEquipmentsByLayersAndIds(searchEquipments);
    this.featuresSelected = this.utilsService.removeDuplicatesFromArr(
      [...this.featuresSelected, ...searchEquipmentsRes],
      'id'
    );
    this.filteredFeatures = this.featuresSelected;

    this.mapEventService.highlighSelectedFeatures(
      this.mapService.getMap('home'),
      this.featuresSelected
        .filter((f) => f.isTemp !== true)
        .map((f: any) => {
          return { id: f.id, source: f.lyrTableName };
        })
    );

    if (this.featuresSelected.length > 0) {
      this.mapLayerService.fitBounds(
        'home',
        this.featuresSelected.map((f) => {
          return [+f.x, +f.y];
        })
      );
    }

    this.isLoading = false;
  }

  private hightlightFeatures(features?: any[]): void {
    this.mapEventService.highlighSelectedFeatures(
      this.mapService.getMap('home'),
      (features ?? this.featuresSelected).map((f: any) => {
        return { id: f.id, source: f.lyrTableName };
      })
    );
  }

  private async addNewFeatures(features: any | any[]): Promise<void> {
    if (!Array.isArray(features)) {
      features = [
        {
          ...this.mapLayerService.getFeatureById(
            'home',
            features.layerKey,
            features.featureId
          )['properties'],
          lyrTableName: features.layerKey,
        },
      ];
    } else {
      features = features.map((f) => {
        return {
          ...this.mapLayerService.getFeatureById('home', f.source, f.id)[
          'properties'
          ],
          lyrTableName: f.source,
        };
      });
    }

    features = this.utilsService.removeDuplicatesFromArr(
      [...this.featuresSelected, ...features],
      'id'
    );

    if (this.wkoDraft) {
      const wko: Workorder = await this.workorderService.getWorkorderById(
        this.wkoDraft
      );
      this.workorderService
        .getAllWorkorderTaskStatus()
        .then(async (lStatus) => {
          // When editing the asset of a workorder
          // If the workorder has tasks on XY then remove them from the list
          wko.tasks = wko.tasks.filter((t) => !t.assObjTable.includes('_xy'));

          for (let f of features) {
            if (!wko.tasks.find((t) => t.assObjRef === f.id)) {
              wko.tasks.push({
                id: this.utilsService.createCacheId(),
                assObjTable: f.lyrTableName,
                assObjRef: f.id,
                latitude: f.y,
                longitude: f.x,
                wtrId: wko.tasks[0]?.wtrId ?? null,
                wtsId: lStatus.find((status) => status.wtsCode == 'CREE')?.id,
              });
            }
          }
          await this.workorderService.saveCacheWorkorder(wko);
        });
    }

    const listNewEquipments = this.utilsService.transformFeaturesIntoSearchEquipments([
      ...this.filteredFeatures,
      ...features
    ], true);

    this.mapEventService.isFeatureFiredEvent = false;

    await this.getEquipmentsData(listNewEquipments);
  }

  public openPopoverButtons(e: Event): void {
    this.popoverButtons.event = e;
    this.popoverButtons.present();
  }
}
