import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'src/app/core/services/dialog.service';
import { DatepickerComponent } from 'src/app/shared/components/datepicker/datepicker.component';
import {
  Subject,
  filter,
  map,
  switchMap,
  takeUntil,
  of,
  forkJoin,
  Observable,
  tap,
  debounceTime,
} from 'rxjs';
import { DateTime } from 'luxon';
import { MapService } from 'src/app/core/services/map/map.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { IonModal } from '@ionic/angular';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { CacheService } from 'src/app/core/services/cache.service';
import { Task, Workorder } from 'src/app/core/models/workorder.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { DateValidator } from 'src/app/shared/form-editor/validators/date.validator';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { CityService } from 'src/app/core/services/city.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { Contract } from 'src/app/core/models/contract.model';
import { City } from 'src/app/core/models/city.model';
import { VLayerWtr } from 'src/app/core/models/layer.model';

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
    private workOrderService: WorkorderService,
    private utils: UtilsService,
    private layerService: LayerService,
    private userService: UserService,
    private cityService: CityService,
    private contractService: ContractService
  ) {}

  @ViewChild('equipmentModal', { static: true })
  public equipmentModal: IonModal;

  public equipments: any[];

  public creationWkoForm: FormGroup;
  public params: any;

  public contracts: Contract[];
  public cities: City[];
  public wtrs: VLayerWtr[];
  public equipmentsDetails: any[] = [];

  public nbEquipments: string;

  public title: string;

  public workorder: Workorder;
  public equipmentName: string;

  public isLoading: boolean = true;

  public creationButonLabel: string;

  // Permissions
  public userHasPermissionSendWorkorder: boolean = false;

  public defaultCreationLabel: string = 'Envoyer à la planification';
  // Label à mettre à jours dès la création d'une ion-list custom
  public createWithoutSendToPlanning = 'Ne pas envoyer à la planification';

  private markerCreation: Map<string, any> = new Map();
  private markerDestroyed: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject<void>();
  private wkoExtToSyncValue: boolean = true;

  async ngOnInit(): Promise<void> {
    this.createForm();

    this.title = 'Générer une interventions';
    this.creationButonLabel = this.defaultCreationLabel;
    this.userHasPermissionSendWorkorder =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.SEND_WORKORDER
      );

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
          if (paramMap.has('lyrTableName')) {
            return of([]);
          } else {
            return this.layerService.getEquipmentsByLayersAndIds(params);
          }
        }),
        map((eqs: any[]) =>
          eqs.map((eq) => {
            return {
              ...eq,
              lyrTableName: this.getKeyFromId(params, eq.id),
            };
          })
        )
      )
      .subscribe(async (equipments: any) => {
        this.equipments = equipments;

        const wkoId = this.activatedRoute.snapshot.params['id'];

        if (wkoId) {
          this.workorder = await this.workOrderService.getWorkorderById(
            Number(wkoId)
          );
          this.equipments = this.workorder.tasks.map((t) => {
            return {
              id: t.assObjRef,
              lyrTableName: t.assObjTable,
              x: t.longitude,
              y: t.latitude,
            };
          });
          this.wkoExtToSyncValue = this.workorder.wkoExtToSync;

          if (this.workorder.id > 0) {
            this.title = `Modification de l'intervention ${this.workorder.wkoName}`;
            this.createWithoutSendToPlanning =
              'Sans envoyer pour planification';
            this.creationButonLabel = 'Modifer';
          }

          await this.initializeFormWithWko();
        } else {
          this.workorder = { id: this.utils.createNegativeId() };
        }

        await this.generateMarker();

        const { wtrId } = this.creationWkoForm.value;

        let assets = [];
        if (this.equipments?.[0] !== null) {
          assets = this.equipments?.map((eq) => {
            return {
              id: this.utils.createNegativeId(),
              assObjRef: eq.id,
              assObjTable: eq.lyrTableName,
              wtrId: wtrId,
              latitude: this.markerCreation.get(eq.id).getLngLat().lat,
              longitude: this.markerCreation.get(eq.id).getLngLat().lng,
            };
          });
        }

        this.workorder.tasks = assets;
        this.workorder.latitude =
          assets?.[0].latitude ?? this.markerCreation.get('xy').getLngLat().lat;
        this.workorder.longitude =
          assets?.[0].longitude ??
          this.markerCreation.get('xy').getLngLat().lng;
        this.workorder.wkoAttachment = false;

        await this.cacheService.saveObject(
          'workorders',
          this.workorder.id.toString(),
          this.workorder
        );

        await this.initializeEquipments();
      });

    this.creationWkoForm.valueChanges
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe$))
      .subscribe(async () => {
        Object.keys(this.creationWkoForm.value).forEach((key) => {
          if (key === 'wtrId') {
            this.workorder.tasks.map((task: Task) => {
              task.wtrId = this.creationWkoForm.value['wtrId'];
              return task;
            });
          } else {
            this.workorder[key] = this.creationWkoForm.value[key];
          }
        });

        await this.cacheService.saveObject(
          'workorders',
          this.workorder.id.toString(),
          this.workorder
        );
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
        this.creationWkoForm.patchValue({
          wkoPlanningStartDate: result[0].toFormat('dd/MM/yyyy'),
        });

        this.creationWkoForm.patchValue({
          wkoPlanningEndDate:
            result?.[1]?.toFormat('dd/MM/yyyy') ??
            result[0].toFormat('dd/MM/yyyy'),
        });
      });
  }

  public createForm(): void {
    this.creationWkoForm = new FormGroup({
      ctrId: new FormControl('', Validators.required),
      ctyId: new FormControl('', Validators.required),
      wtrId: new FormControl('', Validators.required),
      wkoName: new FormControl('', Validators.required),
      wkoAddress: new FormControl(''),
      wkoAgentNb: new FormControl('1', Validators.required),
      wkoPlanningStartDate: new FormControl(
        '',
        Validators.compose([Validators.required, DateValidator.isDateValid])
      ),
      wkoPlanningEndDate: new FormControl(
        '',
        Validators.compose([Validators.required, DateValidator.isDateValid])
      ),
      wkoEmergency: new FormControl(false),
      wkoAppointment: new FormControl(false),
      wkoCreationComment: new FormControl(''),
    });
    this.creationWkoForm.addValidators(
      DateValidator.compareDateValidator(
        'wkoPlanningStartDate',
        'wkoPlanningEndDate'
      )
    );
  }

  public setCheckboxValue(controlKey: string, event: Event): void {
    this.creationWkoForm.controls[controlKey].setValue(
      (event as CustomEvent).detail.checked
    );
  }

  public async onSubmit(): Promise<void> {
    this.creationWkoForm.markAllAsTouched();
    if (!this.creationWkoForm.valid) {
      return;
    }

    const { wtrId, ...form } = this.creationWkoForm.value;

    let assets = [];

    if (this.equipments?.[0] !== null) {
      assets = this.equipments?.map((eq) => {
        return {
          assObjRef: eq.id,
          assObjTable: eq.lyrTableName,
          wtrId: wtrId,
          latitude: this.markerCreation.get(eq.id).getLngLat().lat,
          longitude: this.markerCreation.get(eq.id).getLngLat().lng,
        };
      });
    }

    this.workorder = { id: this.workorder.id, ...form };

    this.workorder.wkoPlanningStartDate = this.utils.convertToDateISO(form.wkoPlanningStartDate);
    this.workorder.wkoPlanningEndDate = this.utils.convertToDateISO(form.wkoPlanningEndDate);

    let funct: any;

    this.workorder.latitude =
      assets?.[0].latitude ?? this.markerCreation.get('xy').getLngLat().lat;
    this.workorder.longitude =
      assets?.[0].longitude ?? this.markerCreation.get('xy').getLngLat().lng;
    this.workorder.wkoAttachment = false;

    this.workorder.tasks = assets;

    this.workorder.wkoExtToSync = this.wkoExtToSyncValue;
    if (this.workorder?.id > 0) {
      funct = this.workOrderService.updateWorkOrder(this.workorder);
    } else {
      form.wkoExtToSync = this.wkoExtToSyncValue;
      funct = this.workOrderService.createWorkOrder(this.workorder);
    }

    funct.subscribe(async (res: Workorder) => {
      this.removeMarkers();
      this.mapService.addGeojsonToLayer(res, 'task');
      if (res.tasks.length == 1) {
        this.drawerService.navigateTo(DrawerRouteEnum.TASK_VIEW, [
          res.id,
          res.tasks[0].id,
        ]);
      } else {
        this.drawerService.navigateTo(DrawerRouteEnum.WORKORDER_VIEW, [res.id]);
      }
      await this.cacheService.deleteObject(
        'workorders',
        this.workorder.id.toString()
      );
    });
  }

  public onCreationModeChange(event: any): void {
    if (event.target.value === 'CREE') {
      this.wkoExtToSyncValue = false;
      this.creationButonLabel = this.createWithoutSendToPlanning;
    } else if (event.target.value === 'CREEAVECENVOIE') {
      this.creationButonLabel = this.defaultCreationLabel;
      this.wkoExtToSyncValue = true;
    }
    this.onSubmit();
  }

  public async openEquipmentModal(): Promise<void> {
    if (this.equipmentsDetails.length === 0) {
      // Create an array of observables for each call to getEquipmentLabel
      const observablesArray = this.equipments.map((eq) =>
        this.getEquipmentLabel(eq).pipe(
          tap((equipmentLabel) => {
            this.equipmentsDetails.push([
              equipmentLabel,
              eq.id,
              eq.lyrTableName,
            ]);
          })
        )
      );

      // Use forkJoin to run all observables in parallel
      forkJoin(observablesArray).subscribe(() => {
        if (this.equipments?.[0] !== null && this.equipments.length >= 1) {
          this.equipmentModal.present();
        }
        if (this.equipmentModal.isOpen) {
          this.equipmentModal.dismiss();
        }
      });
    } else {
      // If equipmentsDetails is not empty, just open the modal
      if (this.equipments?.[0] !== null && this.equipments.length >= 1) {
        this.equipmentModal.present();
      }
      if (this.equipmentModal.isOpen) {
        this.equipmentModal.dismiss();
      }
    }
  }

  public async editEquipmentList(): Promise<void> {
    if (this.workorder) {
      this.drawerService.navigateWithEquipments(
        DrawerRouteEnum.SELECTION,
        this.equipments,
        { draft: this.workorder.id }
      );
    } else {
      await this.cacheService.saveObject(
        'workorders',
        this.workorder.id.toString(),
        this.workorder
      );

      this.drawerService.navigateWithEquipments(
        DrawerRouteEnum.SELECTION,
        this.equipments,
        { draft: this.workorder.id.toString() }
      );
    }
  }

  public getKeys(errors: any): string[] {
    return Object.keys(errors);
  }

  public openEquipmentFromDetail(id: string, lyrTableName: string): void {
    this.drawerService.navigateTo(DrawerRouteEnum.EQUIPMENT, [id], {
      lyrTableName: lyrTableName,
    });
    if (this.equipmentModal.isCmpOpen) {
      this.equipmentModal.dismiss();
    }
  }

  public openEquipment(asset: any): void {
    this.drawerService.navigateTo(DrawerRouteEnum.EQUIPMENT, [asset.id], {
      lyrTableName: asset.lyrTableName,
    });
  }

  private async initializeFormWithWko(): Promise<void> {
    Object.keys(this.workorder).forEach((key) => {
      const control = this.creationWkoForm.get(key);
      if (control) {
        if (this.workorder[key] != null) {
          control.setValue(this.workorder[key]);
        }
      }
    });

    //set WTR
    this.creationWkoForm.controls['wtrId'].setValue(
      this.workorder.tasks[0].wtrId.toString()
    );
  }

  private async initializeEquipments(): Promise<void> {
    if (this.equipments.length > 0 && this.equipments[0] !== null) {
      this.nbEquipments = this.equipments.length.toString();

      // WKO Assets
      await this.initEquipmentsLayers();
      // If mono-equipment, we need the equipment name
      if (this.equipments.length === 1) {
        this.getEquipmentLabel().subscribe((label) => {
          this.equipmentName = label;
        });
      }

      // Ctr and Cty are on the equipments
      const contractsIds: number[] = this.equipments.map(
        (eq) => eq?.ctrId ?? +this.workorder.ctrId
      );
      const cityIds: number[] = this.equipments.map(
        (eq) => eq?.ctyId ?? +this.workorder.ctyId
      );

      // Get referentials data
      this.fetchReferentialsData(contractsIds, cityIds);
    } else {
      // WKO XY
      this.params = { ...this.activatedRoute.snapshot.queryParams };

      // Ctr and Cty are from the URL
      const contractsIds: number[] = this.params.ctrId
        .split(',')
        .map((c: string) => +c);
      const cityIds: number[] = this.params.ctyId
        .split(',')
        .map((c: string) => +c);

      // Get referentials data
      this.fetchReferentialsData(contractsIds, cityIds);
    }
  }

  private fetchReferentialsData(
    contractsIds: number[],
    cityIds: number[]
  ): void {
    forkJoin({
      reasons: this.layerService.getAllVLayerWtr(),
      contracts: this.contractService.getAllContracts(),
      cities: this.cityService.getAllCities(),
    }).subscribe(({ reasons, contracts, cities }) => {
      this.wtrs = this.utils.removeDuplicatesFromArr(reasons, 'wtrId');
      this.contracts = contracts.filter((c) => contractsIds.includes(c.id));
      this.cities = cities.filter((c) => cityIds.includes(c.id));

      // We don't want to erase possible draft entries
      if (this.creationWkoForm.controls['ctyId'].value?.length === 0) {
        this.creationWkoForm.controls['ctyId'].setValue(
          this.utils.findMostFrequentValue(cityIds)
        );
      }

      if (this.creationWkoForm.controls['ctrId'].value?.length === 0) {
        this.creationWkoForm.controls['ctrId'].setValue(
          this.utils.findMostFrequentValue(contractsIds)
        );
      }

      this.isLoading = false;
    });
  }

  public getContractLabel(contract: any): string {
    return contract.ctrLlabel;
  }

  public getCityLabel(city: any): string {
    return city.ctyLlabel;
  }

  public getWtrLabel(reason: any): void {
    return reason.wtrLlabel;
  }

  public getEquipmentLabel(eq?: any): Observable<string> {
    return this.layerService.getAllLayers().pipe(
      map((layersRef) => {
        const layer = layersRef.find(
          (l) =>
            l.lyrTableName ===
            `asset.${(eq ?? this.equipments[0]).lyrTableName}`
        );
        return `${layer.lyrSlabel} - ${layer.domLLabel} `;
      })
    );
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
        if (!this.mapService.hasEventLayer(eq.lyrTableName)) {
          await this.mapService.addEventLayer(eq.lyrTableName);
        }
        if (!this.markerCreation.has(eq.id)) {
          const geom = await this.mapLayerService.getCoordinateFeaturesById(
            eq.lyrTableName,
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
          return { source: f.lyrTableName, id: f.id };
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
  }

  private removeMarkers(): void {
    if (this.markerCreation.size > 0) {
      this.markerCreation.forEach((m) => m.remove());
    }
  }

  private async deleteDraft(): Promise<void> {
    if (+this.workorder.id < 0) {
      await this.cacheService.deleteObject(
        'workorders',
        this.workorder.id.toString()
      );
    }
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
      ({ lyrTableName }) => {
        return this.mapService.addEventLayer(lyrTableName);
      }
    );

    await Promise.all(promises);

    this.mapEvent.highlighSelectedFeatures(
      this.mapService.getMap(),
      this.equipments.map((eq: any) => {
        return { id: eq.id, source: eq.lyrTableName };
      })
    );

    this.mapLayerService.fitBounds(
      this.equipments.map((eq) => {
        return [+eq.x, +eq.y];
      })
    );
  }
}
