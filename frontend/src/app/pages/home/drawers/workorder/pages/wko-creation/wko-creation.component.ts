import { Component, Input, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Params, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'src/app/core/services/dialog.service';
import { DatepickerComponent } from 'src/app/shared/components/datepicker/datepicker.component';
import { Subject, filter, map, switchMap, takeUntil, of } from 'rxjs';
import { DateTime } from 'luxon';
import { DatePipe } from '@angular/common';
import { MapService } from 'src/app/core/services/map/map.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { IonModal } from '@ionic/angular';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { v4 as uuidv4 } from 'uuid';
import { CacheService } from 'src/app/core/services/cache.service';
import { Workorder } from 'src/app/core/models/workorder.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { ReferentialService } from 'src/app/core/services/referential.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { LayerService } from 'src/app/core/services/layer.service';

@Component({
  selector: 'app-wko-creation',
  templateUrl: './wko-creation.component.html',
  styleUrls: ['./wko-creation.component.scss'],
})
export class WkoCreationComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private mapLayerService: MapLayerService,
    private dialogService: DialogService,
    private mapService: MapService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private drawerService: DrawerService,
    private mapEvent: MapEventService,
    private cacheService: CacheService,
    private workorderService: WorkorderService,
    private referentialService: ReferentialService,
    private utils: UtilsService,
    private layerService: LayerService,
    private datePipe: DatePipe
  ) {}

  @ViewChild('equipmentModal', { static: true })
  public equipmentModal: IonModal;

  public equipments: any[];

  public workOrderForm: FormGroup;
  public params: any;

  public contracts: any[];
  public cities: any[];
  public wtrs: any[];
  public equipmentsDetails: any[] = [];

  public idList: string;
  public draftId: string;

  public equipmentName: string;

  public loading: boolean = true;

  private markerCreation: Map<string, any> = new Map();
  private markerDestroyed: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  async ngOnInit(): Promise<void> {
    const paramMap = new Map<string, string>(
      new URLSearchParams(window.location.search).entries()
    );
    const params = this.utils.transformMap(paramMap);
    this.mapService
      .onMapLoaded()
      .pipe(
        filter((isMapLoaded) => isMapLoaded),
        takeUntil(this.ngUnsubscribe$),
        switchMap(() => {
          if (paramMap.has('lyr_table_name')) {
            return of([]);
          } else {
            return this.layerService.getEquipmentsByLayersAndIds(params);
          }
        }),
        map((eqs: any[]) =>
          eqs.map((eq) => {
            return {
              ...eq,
              lyr_table_name: this.getKeyFromId(params, eq.id),
            };
          })
        )
      )
      .subscribe(async (equipments: any) => {
        this.equipments = equipments;

        this.draftId = this.activatedRoute.snapshot.queryParams['draft'];
        this.createForm();

        if (this.draftId) {
          await this.initializeFormWithDraft();
        }

        await this.initializeEquipments();

        this.generateMarker();

        this.loading = false;
      });
  }

  ngAfterViewInit(): void {
    this.router.events
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter(
          (e): e is NavigationStart =>
            e instanceof NavigationStart &&
            !e.url.includes('/home/selection') &&
            !e.url.includes('/home/workorder') &&
            this.activatedRoute.snapshot.queryParams['draft']
        )
      )
      .subscribe(() => {
        this.deleteDraft();
      });
  }

  ngOnDestroy(): void {
    this.markerDestroyed = true;
    this.mapEvent.highlighSelectedFeatures(this.mapService.getMap(), undefined);
    if (this.equipmentModal.isCmpOpen) {
      this.equipmentModal.dismiss();
    }
    this.mapEvent.isFeatureFiredEvent = false;
    this.removeMarkers();
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public openCalendar(): void {
    this.dialogService
      .open(DatepickerComponent, {
        backdrop: false,
        data: {
          multiple: true,
        },
      })
      .afterClosed()
      .pipe(
        filter(
          (dts: DateTime[]) => dts && (dts.length === 1 || dts.length === 2)
        )
      )
      .subscribe((result: DateTime[]) => {
        this.workOrderForm.patchValue({
          wkoPlanningStartDate: this.datePipe.transform(
            result[0].toJSDate(),
            'dd-MM-yyyy'
          ),
        });

        this.workOrderForm.patchValue({
          wkoPlanningEndDate: this.datePipe.transform(
            // if only one day is clicked, end date and start date fields get the same value
            result[1] ? result[1].toJSDate() : result[0].toJSDate(),
            'dd-MM-yyyy'
          ),
        });
      });
  }

  public createForm(): void {
    this.workOrderForm = new FormGroup({
      ctrId: new FormControl('', Validators.required),
      ctyId: new FormControl('', Validators.required),
      wtrId: new FormControl('', Validators.required),
      wkoName: new FormControl('', Validators.required),
      wkoAddress: new FormControl(''),
      wkoAgentNb: new FormControl('1', Validators.required),
      wkoPlanningStartDate: new FormControl(false, Validators.required),
      wkoPlanningEndDate: new FormControl(false, Validators.required),
      wkoEmergency: new FormControl(''),
      wkoAppointment: new FormControl(''),
      wkoCreationComment: new FormControl(''),
    });
  }

  public setCheckboxValue(controlKey: string, event: Event): void {
    this.workOrderForm.controls[controlKey].setValue(
      (event as CustomEvent).detail.checked
    );
  }

  public onSubmit(): void {
    this.workOrderForm.markAllAsTouched();
    if (!this.workOrderForm.valid) {
      return;
    }

    const { wtrId, ...form } = this.workOrderForm.value;

    let assets = [];

    if (this.equipments?.[0] !== null) {
      assets = this.equipments?.map((eq) => {
        return {
          assObjRef: eq.id,
          assObjTable: eq.lyr_table_name,
          wtrId: wtrId,
          latitude: this.markerCreation.get(eq.id).getLngLat().lat,
          longitude: this.markerCreation.get(eq.id).getLngLat().lng,
        };
      });
    }

    let [day, month, year] = form.wkoPlanningStartDate.split('-');
    form.wkoPlanningStartDate = this.datePipe.transform(
      new Date(year, month - 1, day),
      'yyyy-MM-dd'
    );
    [day, month, year] = form.wkoPlanningEndDate.split('-');
    form.wkoPlanningEndDate = this.datePipe.transform(
      new Date(year, month - 1, day),
      'yyyy-MM-dd'
    );
    form.tasks = assets;
    form.latitude =
      assets?.[0].latitude ?? this.markerCreation.get('xy').getLngLat().lat;
    form.longitude =
      assets?.[0].longitude ?? this.markerCreation.get('xy').getLngLat().lng;

    this.workorderService.createWorkOrder(form).subscribe((res: Workorder) => {
      this.removeMarkers();
      this.mapLayerService.addGeojsonToLayer(res, 'task');
      if(res.tasks.length == 1) {
        this.drawerService.navigateTo(
          DrawerRouteEnum.TASK_VIEW,
          [res.id, res.tasks[0].id]
        );
      } else {
        this.drawerService.navigateTo(
          DrawerRouteEnum.WORKORDER_VIEW,
          [res.id]
        );
      }
    });
  }

  public async openEquipmentModal(): Promise<void> {
    if (this.equipmentsDetails.length === 0) {
      for (const eq of this.equipments) {
        const equipmentLabel = await this.getEquipmentLabel(eq);
        this.equipmentsDetails.push([equipmentLabel, eq.id, eq.lyr_table_name]);
      }
    }

    if (this.equipments?.[0] !== null && this.equipments.length >= 1) {
      this.equipmentModal.present();
    }
    if (this.equipmentModal.isOpen) {
      this.equipmentModal.dismiss();
    }
  }

  public async editEquipmentList(): Promise<void> {
    const uuid = this.draftId ?? uuidv4();

    await this.cacheService.saveObject(
      'draftwko',
      uuid,
      this.workOrderForm.value
    );

    this.drawerService.navigateWithEquipments(
      DrawerRouteEnum.SELECTION,
      this.equipments,
      { draft: uuid }
    );
  }

  public getKeys(errors: any): string[] {
    return Object.keys(errors);
  }

  public openEquipmentFromDetail(id: string, lyrTableName: string): void {
    this.drawerService.navigateTo(DrawerRouteEnum.EQUIPMENT, [id], {
      lyr_table_name: lyrTableName,
    });
    if (this.equipmentModal.isCmpOpen) {
      this.equipmentModal.dismiss();
    }
  }

  public openEquipment(asset: any): void {
    this.drawerService.navigateTo(DrawerRouteEnum.EQUIPMENT, [asset.id], {
      lyr_table_name: asset.lyr_table_name,
    });
  }

  private async initializeFormWithDraft(): Promise<void> {
    const wkoDraft = await this.cacheService.getObjectFromCache(
      'draftwko',
      this.draftId
    );

    if (!wkoDraft) {
      this.drawerService.navigateWithEquipments(
        DrawerRouteEnum.WORKORDER_CREATION,
        this.equipments
      );
      return;
    }

    Object.keys(wkoDraft.data).forEach((key) => {
      const control = this.workOrderForm.get(key);
      if (control) {
        control.setValue(wkoDraft.data[key]);
      }
    });
  }

  private async initializeEquipments(): Promise<void> {
    let contractsIds: any[], cityIds: any[];

    if (this.equipments.length > 0 && this.equipments[0] !== null) {
      // WKO Assets
      await this.initEquipmentsLayers();
      // If mono-equipment, we need the equipment name
      if (this.equipments.length === 1) {
        this.equipmentName = await this.getEquipmentLabel();
      }

      // Get reasons for all equipments, then remove duplicates
      this.wtrs = this.utils.removeDuplicatesFromArr(
        await this.referentialService.getReferential('v_layer_wtr'),
        'wtr_id'
      );

      // Ctr and Cty are on the equipments
      contractsIds = this.equipments.map((eq) => eq.ctr_id);
      cityIds = this.equipments.map((eq) => eq.cty_id);

      this.idList = this.equipments.length.toString();
    } else {
      // WKO XY
      this.params = { ...this.activatedRoute.snapshot.queryParams };

      // When in XY, we need all reasons, without duplicates
      this.wtrs = this.utils.removeDuplicatesFromArr(
        await this.referentialService.getReferential('v_layer_wtr'),
        'wtr_id'
      );

      // Ctr and Cty are from the URL
      contractsIds = this.params.ctr_id.split(',').map((c: string) => +c);
      cityIds = this.params.cty_id.split(',').map((c: string) => +c);
    }

    this.cities = (await this.referentialService.getReferential('city')).filter(
      (c) => cityIds.includes(c.id)
    );

    this.contracts = (
      await this.referentialService.getReferential('contract')
    ).filter((c) => contractsIds.includes(+c.id));

    // We don't want to erase possible draft entries
    if (this.workOrderForm.controls['ctyId'].value.length === 0) {
      this.workOrderForm.controls['ctyId'].setValue(
        this.utils.findMostFrequentValue(cityIds)
      );
    }

    if (this.workOrderForm.controls['ctrId'].value.length === 0) {
      this.workOrderForm.controls['ctrId'].setValue(
        this.utils.findMostFrequentValue(contractsIds)
      );
    }
  }

  public simplifyEquipmentLabel(asset: any): string {
    return this.utils.simplifyAssetLabel(asset.lyr_table_name);
  }

  public getContractLabel(contract: any): string {
    return contract.ctr_llabel;
  }

  public getCityLabel(city: any): string {
    return city.cty_llabel;
  }

  public getWtrLabel(reason: any): void {
    return reason.wtr_llabel;
  }

  public async getEquipmentLabel(eq?: any): Promise<string> {
    const layersRef = await this.referentialService.getReferential('layers');
    const layer = layersRef.find(
      (l) =>
        l.lyrTableName === `asset.${(eq ?? this.equipments[0]).lyr_table_name}`
    );
    return `${layer.lyrSlabel} - ${layer.domLLabel} `;
  }

  /**
   * Generate a marker on the map.
   * Case 1 : Marker on the equipment and only draggable on it
   * Case 2 : Marker on the map and draggable on all the map. Update the params if the position change (city&contract)
   */
  private async generateMarker(): Promise<void> {
    // Asset WKO
    if (this.equipments.length > 0 && this.equipments?.[0] !== null) {
      for (let eq of this.equipments) {
        if (!this.mapService.hasEventLayer(eq.lyr_table_name)) {
          await this.mapService.addEventLayer(eq.lyr_table_name);
        }
        if (!this.markerCreation.has(eq.id)) {
          const geom = await this.mapLayerService.getCoordinateFeaturesById(
            eq.lyr_table_name,
            eq.id
          );
          this.markerCreation.set(
            eq.id,
            this.mapLayerService.addMarker(eq.x, eq.y, geom)
          );
        }
      }
      this.mapEvent.highlighSelectedFeatures(
        this.mapService.getMap(),
        this.equipments.map((f) => {
          return { source: f.lyr_table_name, id: f.id };
        })
      );
      // XY WKO
    } else {
      if (!this.markerCreation.has('xy')) {
        this.markerCreation.set(
          'xy',
          this.mapLayerService.addMarker(
            this.params.x,
            this.params.y,
            [this.params.x, this.params.y],
            true
          )
        );
      }
      if (this.markerDestroyed) {
        this.removeMarkers();
      }
    }

    // Does not work anymore with the new version without Form Editor, need to be repaired or fixed in a bug report
    // this.markerCreation.on('dragend', (e) => {
    //   this.referentialService
    //     .getReferentialIdByLongitudeLatitude(
    //       'contract',
    //       this.markerCreation.getLngLat().lng,
    //       this.markerCreation.getLngLat().lat
    //     )
    //     .subscribe((l_ctr_id) => {
    //       this.workOrder.ctr_id = l_ctr_id;
    //     });
    //   this.referentialService
    //     .getReferentialIdByLongitudeLatitude(
    //       'city',
    //       this.markerCreation.getLngLat().lng,
    //       this.markerCreation.getLngLat().lat
    //     )
    //     .subscribe((l_cty_id) => {
    //       this.workOrder.cty_id = l_cty_id;
    //     });
    // });
    // }
  }

  private removeMarkers(): void {
    if (this.markerCreation.size > 0) {
      this.markerCreation.forEach((m) => m.remove());
    }
  }

  private async deleteDraft(): Promise<void> {
    await this.cacheService.deleteObject('draftwko', this.draftId);
  }

  private getKeyFromId(
    map: { lyrTableName: string; equipmentIds: string[] }[],
    idToSearch: string
  ): string | undefined {
    for (const m of map) {
      if (m.equipmentIds.includes(idToSearch)) {
        return m.lyrTableName;
      }
    }
    return undefined; // If the id is not found in any value array, return undefined.
  }

  private async initEquipmentsLayers(): Promise<void> {
    const promises: Promise<void>[] = this.equipments.map(
      ({ lyr_table_name }) => {
        return this.mapService.addEventLayer(lyr_table_name);
      }
    );

    await Promise.all(promises);

    this.mapEvent.highlighSelectedFeatures(
      this.mapService.getMap(),
      this.equipments.map((eq: any) => {
        return { id: eq.id, source: eq.lyr_table_name };
      })
    );

    this.mapLayerService.fitBounds(
      this.equipments.map((eq) => {
        return [+eq.x, +eq.y];
      })
    );
  }
}
