import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
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
  skipWhile,
  firstValueFrom,
  fromEvent,
  Subscription,
} from 'rxjs';
import { DateTime } from 'luxon';
import { DatePipe } from '@angular/common';
import { MapService } from 'src/app/core/services/map/map.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { IonModal } from '@ionic/angular';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { CacheService } from 'src/app/core/services/cache.service';
import {
  Task,
  Workorder,
  WorkorderType,
} from 'src/app/core/models/workorder.model';
import { WorkorderService } from 'src/app/core/services/workorder.service';
import { MapLayerService } from 'src/app/core/services/map/map-layer.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { LayerService } from 'src/app/core/services/layer.service';
import { DateValidator } from 'src/app/shared/form-editor/validators/date.validator';
import { TimeValidator } from 'src/app/shared/form-editor/validators/time.validator';
import { UserService } from 'src/app/core/services/user.service';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { CityService } from 'src/app/core/services/city.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { Contract } from 'src/app/core/models/contract.model';
import { City } from 'src/app/core/models/city.model';
import { Layer, VLayerWtr } from 'src/app/core/models/layer.model';

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
  ) {
    this.router.events
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(async () => {
        this.removeMarkers();
        await this.ngOnInit();
      });
  }

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

  private isXY: boolean = false;
  private markerCreation: Map<string, any> = new Map();
  private markerSubscription: Map<string, Subscription> = new Map();
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
            return this.cacheService.getFeaturesByLayersAndIds(
              params.map((p) => p.lyrTableName),
              this.utils.flattenEquipments(params)
            );
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
          // EDIT
          this.workorder = await this.workOrderService.getWorkorderById(
            Number(wkoId)
          );

          this.equipments = this.workorder.tasks.map((t) => {
            return {
              id: t.assObjRef ?? this.utils.createCacheId().toString(),
              lyrTableName: t.assObjTable,
              x: t.longitude,
              y: t.latitude,
              assetForSig: t.assetForSig,
              taskId: t.id,
            };
          });

          // if (this.equipments.length === 1 && this.equipments[0].lyrTableName.includes('_xy')) this.isXY = true;

          if (this.workorder.id > 0) {
            this.title = `Modification de l'intervention ${this.workorder.wkoName}`;
            this.createWithoutSendToPlanning =
              'Sans envoyer pour planification';
            this.creationButonLabel = 'Modifer';
          }

          await this.initializeFormWithWko();
        } else {
          this.workorder = { id: this.utils.createCacheId(), isDraft: true };
          if (this.equipments.length > 0) {
            // CREATION
            this.isXY = false;
            this.workorder.tasks = this.equipments.map((eq) => {
              return {
                id: this.utils.createCacheId(),
                assObjRef: eq.id,
                assObjTable: eq.lyrTableName,
                wtrId: null,
                longitude: eq.x,
                latitude: eq.y,
              };
            });
          } else {
            // XY CREATION
            this.isXY = true;
            this.workorder = {
              id: this.utils.createCacheId(),
              isDraft: true,
              tasks: [],
            };
          }
        }

        await this.initializeEquipments();

        this.workorder.wkoAttachment = false;

        await this.generateMarker();

        await this.saveWorkOrderInCache();
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
      wkoAgentNb: new FormControl(1, Validators.required),
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
      wkoPlanningStartHour: new FormControl('', [TimeValidator.isHourValid]),
      wkoPlanningEndHour: new FormControl('', [TimeValidator.isHourValid]),
    });
    this.creationWkoForm.addValidators(
      DateValidator.compareDateValidator(
        'wkoPlanningStartDate',
        'wkoPlanningEndDate'
      )
    );
    this.creationWkoForm.addValidators(
      TimeValidator.compareTimeValidatorWithTrigger(
        'wkoPlanningStartHour',
        'wkoPlanningEndHour',
        'wkoAppointment'
      )
    );
  }

  public onStartHourChange(controlKey: string, event: Event): void {
    if (!this.creationWkoForm.controls['wkoPlanningEndHour'].value) {
      const end = DateTime.fromFormat(
        this.creationWkoForm.controls['wkoPlanningStartHour'].value,
        'HH:mm'
      );
      this.creationWkoForm.controls['wkoPlanningEndHour'].setValue(
        end.plus({ hours: 1 }).toFormat('HH:mm')
      );
    }
  }

  public setCheckboxValue(controlKey: string, event: Event): void {
    this.creationWkoForm.controls[controlKey].setValue(
      (event as CustomEvent).detail.checked
    );
    if (
      controlKey === 'wkoPlanningStartHour' ||
      controlKey === 'wkoPlanningEndHour'
    ) {
      if ((event as CustomEvent).detail.checked) {
        this.creationWkoForm.controls['wkoPlanningStartHour'].addValidators([
          Validators.required,
          TimeValidator.isHourValid,
        ]);
        this.creationWkoForm.controls['wkoPlanningEndHour'].addValidators([
          Validators.required,
          TimeValidator.isHourValid,
        ]);
      } else {
        this.creationWkoForm.controls['wkoPlanningStartHour'].clearValidators();
        this.creationWkoForm.controls['wkoPlanningEndHour'].clearValidators();
      }
      this.creationWkoForm.controls[
        'wkoPlanningStartHour'
      ].updateValueAndValidity({
        emitEvent: false,
      });
      this.creationWkoForm.controls[
        'wkoPlanningEndHour'
      ].updateValueAndValidity({
        emitEvent: false,
      });
    }
  }

  public async onSubmit(): Promise<void> {
    this.creationWkoForm.markAllAsTouched();
    if (!this.creationWkoForm.valid) {
      return;
    }

    const { wtrId, ...form } = this.creationWkoForm.value;

    let assets = [];

    if (this.equipments.length > 0) {
      assets = this.equipments?.map((eq) => {
        return {
          assObjRef: this.isXY ? undefined : eq.id,
          assObjTable: eq.lyrTableName,
          wtrId: wtrId,
          longitude: eq.x,
          latitude: eq.y,
          assetForSig: eq.assetForSig,
          taskId: eq?.taskId,
        };
      });
    }

    this.workorder = {
      id: this.workorder.id,
      tasks: this.workorder.tasks,
      ...form,
    };

    this.workorder.wkoPlanningStartDate = this.utils.convertToDateWithTime(
      form.wkoPlanningStartDate,
      form.wkoPlanningStartHour
    );
    this.workorder.wkoPlanningEndDate = this.utils.convertToDateWithTime(
      form.wkoPlanningEndDate,
      form.wkoPlanningEndHour
    );

    this.workorder.wkoDmod = new Date();
    if (!this.workorder.id) {
      this.workorder.id = this.utils.createCacheId();
    }

    let funct: any;

    this.workorder.latitude = assets?.[0]?.latitude;
    this.workorder.longitude = assets?.[0]?.longitude;
    this.workorder.wkoAttachment = false;

    if (this.workorder.tasks?.length == 0) {
      this.workorder.tasks = assets;
    } else {
      const existingTaskIds = new Set<string>();

      assets.forEach((asset) => {
        const existingTask = this.workorder.tasks.find(
          (t) => t.assObjRef === asset.assObjRef || t.id === asset?.taskId
        );

        if (!existingTask) {
          this.workorder.tasks.push(asset);
          existingTaskIds.add(asset.assObjRef);
        } else {
          existingTask.longitude = asset.longitude;
          existingTask.latitude = asset.latitude;
        }
      });
    }

    this.workorder.wkoExtToSync = this.wkoExtToSyncValue;
    if (this.workorder?.id > 0) {
      funct = this.workOrderService.updateWorkOrder(this.workorder);
    } else {
      form.wkoExtToSync = this.wkoExtToSyncValue;
      funct = this.workOrderService.createWorkOrder(this.workorder);
    }

    funct.subscribe(async (res: Workorder) => {
      this.removeMarkers();
      this.workorder.isDraft = false;
      this.mapService.addGeojsonToLayer(res, 'task');
      if (res.tasks.length == 1) {
        this.drawerService.navigateTo(DrawerRouteEnum.TASK_VIEW, [
          res.id,
          res.tasks[0].id,
        ]);
      } else {
        this.drawerService.navigateTo(DrawerRouteEnum.WORKORDER_VIEW, [res.id]);
      }
      if (!res.syncOperation) {
        this.workOrderService.deleteCacheWorkorder(this.workorder);
      }
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
    this.workOrderService.saveCacheWorkorder(this.workorder);
    this.drawerService.navigateWithEquipments(
      DrawerRouteEnum.SELECTION,
      this.equipments,
      { draft: this.workorder.id }
    );
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
      if (!control) {
        return;
      }

      if (this.workorder[key] != null) {
        if (key == 'wkoPlanningStartDate') {
          control.setValue(
            DateTime.fromISO(this.workorder[key] as any).toFormat('dd/MM/yyyy'),
            { emitEvent: false }
          );
          const startHour = DateTime.fromISO(
            this.workorder[key].toString()
          ).toFormat('HH:mm');
          this.creationWkoForm.get('wkoPlanningStartHour').setValue(startHour);
        } else if (key == 'wkoPlanningEndDate') {
          control.setValue(
            DateTime.fromISO(this.workorder[key] as any).toFormat('dd/MM/yyyy'),
            { emitEvent: false }
          );
          const endHour = DateTime.fromISO(
            this.workorder[key].toString()
          ).toFormat('HH:mm');
          this.creationWkoForm.get('wkoPlanningEndHour').setValue(endHour);
        } else if (key === 'wkoAppointment' || key === 'wkoEmergency') {
          this.workorder[key].toString() === 'false'
            ? (this.workorder[key] = false)
            : true;
          control.setValue(this.workorder[key], { emitEvent: false });
        } else {
          control.setValue(this.workorder[key], { emitEvent: false });
        }
      }
    });

    //set WTR
    this.creationWkoForm.get('wtrId').setValue(this.workorder.tasks[0]?.wtrId);
  }

  private async initializeEquipments(): Promise<void> {
    if (!this.isXY) {
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

      const layer = await firstValueFrom(
        this.layerService
          .getAllLayers()
          .pipe(
            map(
              (ls: Layer[]) =>
                ls.filter(
                  (l: Layer) =>
                    l.domCode === this.params.waterType &&
                    l.lyrTableName.includes('xy')
                )[0]
            )
          )
      );

      this.equipments = [
        {
          id: this.utils.createCacheId().toString(),
          lyrTableName: layer.lyrTableName,
          x: this.params.x,
          y: this.params.y,
          assetForSig: undefined,
          taskId: undefined,
        },
      ];

      this.equipmentName = `XY - ${layer.domLLabel}`;

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
      if (this.equipments.length > 0) {
        reasons = reasons.filter((vlw: VLayerWtr) =>
          this.equipments
            .map((eq) => eq.lyrTableName)
            .includes(vlw.lyrTableName)
        );
      }
      this.wtrs = this.utils.removeDuplicatesFromArr(reasons, 'wtrId');

      if (
        !this.wtrs.some(
          (v) => v.wtrId === this.creationWkoForm.get('wtrId').value
        )
      ) {
        this.creationWkoForm.patchValue(
          { wtrId: undefined },
          { emitEvent: false }
        );
      }

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

      // We listen to the changes only after the form is set
      this.listenToFormChanges();
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
          (l) => l.lyrTableName === `${(eq ?? this.equipments[0]).lyrTableName}`
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
    for (let eq of this.equipments) {
      if (!this.mapService.hasEventLayer(eq.lyrTableName)) {
        await this.mapService.addEventLayer(eq.lyrTableName);
      }
      if (!this.markerCreation.has(eq.id)) {
        if (eq.id.startsWith('TMP-')) {
          this.markerCreation.set(
            eq.id,
            this.mapLayerService.addMarker(eq.x, eq.y, [eq.x, eq.y], true)
          );
        } else {
          if (this.isXY) {
            this.markerCreation.set(
              eq.id,
              this.mapLayerService.addMarker(
                this.params.x,
                this.params.y,
                [this.params.x, this.params.y],
                true
              )
            );
          } else {
            let geom = undefined;
            if (!eq.lyrTableName.includes('_xy')) {
              geom = await this.mapLayerService.getCoordinateFeaturesById(
                eq.lyrTableName,
                eq.id
              );
            }
            this.markerCreation.set(
              eq.id,
              this.mapLayerService.addMarker(
                eq.x,
                eq.y,
                geom ?? [eq.x, eq.y],
                geom ? false : true
              )
            );
          }
        }
      }
      this.markerSubscription.set(
        eq.id,
        fromEvent(this.markerCreation.get(eq.id), 'dragend').subscribe(() => {
          eq.x = this.markerCreation.get(eq.id).getLngLat().lng;
          eq.y = this.markerCreation.get(eq.id).getLngLat().lat;
        })
      );
    }
    this.mapEvent.highlighSelectedFeatures(
      this.mapService.getMap(),
      this.equipments
        .filter((f) => !f.lyrTableName.includes('_xy'))
        .map((f) => {
          return { source: f.lyrTableName, id: f.id };
        })
    );
    if (this.markerDestroyed) {
      this.removeMarkers();
    }
  }

  private removeMarkers(): void {
    if (this.markerCreation.size > 0) {
      this.markerCreation.forEach((m) => m.remove());
    }
    if (this.markerSubscription.size > 0) {
      this.markerSubscription.forEach((m) => m.unsubscribe());
    }
    this.markerCreation.clear();
    this.markerSubscription.clear();
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
        if (m.lyrTableName.includes('asset.')) {
          return m.lyrTableName.split('asset.')[1];
        }
        return m.lyrTableName;
      }
    }
    return undefined; // If the id is not found in any value array, return undefined.
  }

  private async initEquipmentsLayers(): Promise<void> {
    const currentEqs = this.equipments.filter(
      ({ lyrTableName }) => !lyrTableName.includes('_xy')
    );
    const promises: Promise<void>[] = currentEqs.map(({ lyrTableName }) => {
      return this.mapService.addEventLayer(lyrTableName);
    });

    await Promise.all(promises);

    this.mapEvent.highlighSelectedFeatures(
      this.mapService.getMap(),
      currentEqs.map((eq: any) => {
        return { id: eq.id, source: eq.lyrTableName };
      })
    );

    this.mapLayerService.fitBounds(
      this.equipments.map((eq) => {
        return [+eq.x, +eq.y];
      })
    );
  }

  private listenToFormChanges(): void {
    this.creationWkoForm.valueChanges
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe$))
      .subscribe(async () => {
        await this.saveWorkOrderInCache();
      });
  }

  private async saveWorkOrderInCache(): Promise<void> {
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
    this.workorder.wkoPlanningStartDate = DateTime.fromFormat(
      this.workorder.wkoPlanningStartDate as any,
      'dd/MM/yyyy'
    ).toISO() as any;
    this.workorder.wkoPlanningEndDate = DateTime.fromFormat(
      this.workorder.wkoPlanningEndDate as any,
      'dd/MM/yyyy'
    ).toISO() as any;
    await this.workOrderService.saveCacheWorkorder(this.workorder);
  }
}
