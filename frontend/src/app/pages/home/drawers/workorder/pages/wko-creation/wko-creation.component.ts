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
  forkJoin,
  Observable,
  tap,
  debounceTime,
  firstValueFrom,
  fromEvent,
  Subscription,
  finalize,
} from 'rxjs';
import { DateTime } from 'luxon';
import { MapService } from 'src/app/core/services/map/map.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { IonModal, ModalController } from '@ionic/angular';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { CacheKey, CacheService } from 'src/app/core/services/cache.service';
import { Task, Workorder, WorkorderTaskStatus } from 'src/app/core/models/workorder.model';
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
import { MulticontractModalComponent } from '../multicontract-modal/multicontract-modal.component';

const WTR_CODE_POSE = '10';

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
    private utils: UtilsService,
    private layerService: LayerService,
    private userService: UserService,
    private cityService: CityService,
    private contractService: ContractService,
    private modalCtrl: ModalController
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

  public currentContract: Contract;
  public currentStatus: string;

  public contracts: Contract[];
  public cities: City[];
  public wtrs: VLayerWtr[];
  public equipmentsDetails: any[] = [];
  public layers: Layer[];

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

  public isCreation: boolean = true;
  public isXY: boolean = false;

  private markerCreation: Map<string, any> = new Map();
  private markerSubscription: Map<string, Subscription> = new Map();
  private markerDestroyed: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject<void>();
  private wkoExtToSyncValue: boolean = true;
  private currentDateValue: string;

  public displayLayerSelect = false;

  async ngOnInit(): Promise<void> {
    this.createForm();

    this.title = 'Générer une intervention';
    this.creationButonLabel = this.defaultCreationLabel;

    this.userHasPermissionSendWorkorder =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.SEND_WORKORDER
      );
    const paramMap = new Map<string, string>(
      new URLSearchParams(window.location.search).entries()
    );

    const params = this.utils.transformMap(paramMap, true);

    this.mapService
      .onMapLoaded()
      .pipe(
        filter((isMapLoaded) => isMapLoaded),
        takeUntil(this.ngUnsubscribe$),
        switchMap(async () => {
          if (paramMap.size > 0) {
            if (paramMap.has('lyrTableName')) {
              this.isXY = true;
              return [];
            } else {
              return this.layerService.getEquipmentsByLayersAndIds(params);
            }
          } else {
            return this.handleEditMode();
          }
        })
      )
      .subscribe(async (equipments: any) => {
        this.equipments = equipments;
        this.nbEquipments = this.equipments.length.toString();

        const wkoId = this.activatedRoute.snapshot.params['id'];

        // Edit Mode
        if (!this.isCreation) {
          if (wkoId > 0) {
            this.title = `Modification de l'intervention ${this.workorder.wkoName}`;
            this.createWithoutSendToPlanning =
              'Sans envoyer pour planification';
            this.creationButonLabel = 'Modifer';
          }
          await this.initializeFormWithWko();
        }
        // Creation Mode
        else {
          this.workorder = {
            id: this.utils.createCacheId(),
            isDraft: true,
            wkoAttachment: false,
            tasks: [],
          };
          if (this.isXY) {
            this.params = { ...this.activatedRoute.snapshot.queryParams };
          } else {
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
          }
        }

        await this.initializeEquipments();

        await this.saveWorkOrderInCache();
      });

    this.creationWkoForm
      .get('ctrId')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((contractId: number) => {
        this.currentContract = this.contracts.find(
          (c) => Number(c.id) === Number(contractId)
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
          wkoPlanningEndDate:
            result?.[1]?.toFormat('dd/MM/yyyy') ??
            result[0].toFormat('dd/MM/yyyy'),
        });
      });
  }

  public createForm(): void {
    this.creationWkoForm = new FormGroup({
      ctrId: new FormControl('', [Validators.required]),
      ctyId: new FormControl('', [Validators.required]),
      wtrId: new FormControl('', [Validators.required]),
      lyrTableName: new FormControl(null),
      wkoName: new FormControl('', {
        validators: Validators.required,
        updateOn: 'blur',
      }),
      wkoAddress: new FormControl('', {
        validators: Validators.required,
        updateOn: 'blur',
      }),
      wkoAgentNb: new FormControl(1, {
        validators: Validators.required,
        updateOn: 'blur',
      }),
      wkoPlanningStartDate: new FormControl(
        '',
        Validators.compose([Validators.required, DateValidator.isDateValid])
      ),
      wkoPlanningEndDate: new FormControl(
        '',
        Validators.compose([Validators.required, DateValidator.isDateValid])
      ),
      wkoEmergency: new FormControl(false, { updateOn: 'blur' }),
      wkoAppointment: new FormControl(false, { updateOn: 'blur' }),
      wkoCreationComment: new FormControl('', { updateOn: 'blur' }),
      wkoPlanningStartHour: new FormControl('', {
        validators: TimeValidator.isHourValid,
        updateOn: 'blur',
      }),
      wkoPlanningEndHour: new FormControl('', {
        validators: TimeValidator.isHourValid,
        updateOn: 'blur',
      }),
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

    this.creationWkoForm.get('wtrId').valueChanges.subscribe((wtrId) => {
      // Creation - If it is a XY asset with the 'Pose' reason then the asset type is required
      if (this.isCreation && this.isXY) {
        const wtr = this.wtrs.find((wtr) => wtr.wtrId === wtrId);
        if (wtr.wtrCode === WTR_CODE_POSE) {
          this.creationWkoForm
            .get('lyrTableName')
            .addValidators(Validators.required);
          this.displayLayerSelect = true;
        } else {
          this.creationWkoForm
            .get('lyrTableName')
            .removeValidators(Validators.required);
          this.displayLayerSelect = false;
        }
        this.creationWkoForm.get('lyrTableName').updateValueAndValidity();
      }
    });
  }

  /**
   * manage keydown event on date input
   * prevent non numeric input
   * @param event
   */
  public onDateKeyDown(event: any) {
    this.currentDateValue = event.target.value;
    if (!DateValidator.isKeyValid(event, this.currentDateValue)) {
      event.preventDefault();
    }
  }

  /**
   * manage keyup event on date input
   * post treatment for date format
   * @param event
   */
  public onDateKeyUp(event: any) {
    event.target.value = DateValidator.formatDate(event, this.currentDateValue);
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

    this.isLoading = true;
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

    this.workorder.latitude = assets?.[0]?.latitude;
    this.workorder.longitude = assets?.[0]?.longitude;

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

    // Creation - Case of a 'Pose' reason on a XY asset
    if (this.isCreation && this.isXY && wtrId === -1) {
      // Change the task to be on the asset selected
      const task = this.workorder.tasks[0];
      task.assObjTable = form.lyrTableName;
      task.assObjRef = null;

      // Change the reason to be the 'Pose' reason of the layer selected
      const listWtr = await this.layerService.getAllVLayerWtr();
      const wtr = listWtr.find(
        (wtr) =>
          wtr.wtrCode === WTR_CODE_POSE && wtr.lyrTableName === task.assObjTable
      );
      task.wtrId = wtr?.wtrId;
    }

    let funct: any;
    if (this.workorder?.id > 0) {
      funct = this.workorderService.updateWorkOrder(this.workorder);
    } else {
      form.wkoExtToSync = this.wkoExtToSyncValue;
      funct = this.workorderService.createWorkOrder(this.workorder);
    }

    funct.then(async (res: Workorder) => {
      this.isLoading = false;
      this.isCreation = false;
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
        this.workorderService.deleteCacheWorkorder(this.workorder);
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
      const promisesArray = this.equipments.map((eq) => this.getEquipmentLabel(eq)
        .then((equipmentLabel) => {
          this.equipmentsDetails.push([
            equipmentLabel,
            eq.id,
            eq.lyrTableName,
          ]);
        }));

      // Use forkJoin to run all observables in parallel
      Promise.all(promisesArray).then(() => {
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
    this.workorderService.saveCacheWorkorder(this.workorder);
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

    this.workorderService.getAllWorkorderTaskStatus().then((status: WorkorderTaskStatus[]) => {
      this.currentStatus = status.find((s) => s.id === this.workorder.wtsId)?.wtsLlabel;
    })
  }

  private async initializeEquipments(): Promise<void> {
    let contractsIds: number[];
    let cityIds: number[];
    if (!this.isXY) {
      // WKO Assets
      // If mono-equipment, we need the equipment name
      if (this.equipments.length === 1) {
        this.getEquipmentLabel().then((label: string) => {
          this.equipmentName = label;
        });
      }

      // Ctr and Cty are on the equipments
      contractsIds = this.equipments.map(
        (eq) => eq?.ctrId ?? +this.workorder.ctrId
      );

      cityIds = this.equipments.map((eq) => eq?.ctyId ?? +this.workorder.ctyId);
    } else {
      // WKO XY
      const layers = await this.layerService.getAllLayers();
      const layer = layers.filter(
        (l: Layer) =>
          l.domCode === this.params.waterType &&
          l.lyrTableName.includes('xy')
      )[0];

      this.equipments = [
        {
          id: this.utils.createCacheId().toString(),
          lyrTableName: layer.lyrTableName,
          x: this.params.x,
          y: this.params.y,
          assetForSig: undefined,
          taskId: undefined,
          isXY: true,
        },
      ];

      this.equipmentName = `XY - ${layer.domLLabel}`;

      // Ctr and Cty are from the URL
      contractsIds = this.params.ctrId.split(',').map((c: string) => +c);
      cityIds = this.params.ctyId.split(',').map((c: string) => +c);
    }
    await this.initEquipmentsLayers();
    // Get referentials data
    await this.fetchReferentialsData(contractsIds, cityIds);
  }

  private async fetchReferentialsData(
    contractsIds: number[],
    cityIds: number[]
  ): Promise<void> {
    this.cityService
      .getAdressByXY(
        this.params?.x ?? this.equipments[0].x,
        this.params?.y ?? this.equipments[0].y
      )
      .then((addresse) =>
        this.creationWkoForm.patchValue(
          {
            wkoAddress: addresse.features[0]?.properties['label'],
          },
          { emitEvent: false }
        )
      );

    forkJoin({
      freasons: this.layerService.getAllVLayerWtr(),
      contracts: this.contractService.getAllContracts(),
      cities: this.cityService.getAllCities(),
      layers: this.layerService.getAllLayers(),
    }).subscribe(async ({ freasons, contracts, cities, layers }) => {
      const reasons = freasons.filter((vlw: VLayerWtr) =>
        this.equipments.map((eq) => eq.lyrTableName).includes(vlw.lyrTableName)
      );

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

      // If contracts has a length > 1, then the assets have different contracts
      if (this.equipments.length > 1 && this.contracts.length > 1) {
        const modal = await this.modalCtrl.create({
          component: MulticontractModalComponent,
          componentProps: {
            contracts: this.contracts,
            assets: this.equipments,
          },
          backdropDismiss: false,
        });
        modal.present();

        const { data } = await modal.onWillDismiss();

        if (data === null) {
          this.editEquipmentList();
        } else {
          // Filtering equipments with the selected contract
          this.contracts = [data];
          // Temp assets need to be merged with current equipements
          this.equipments = this.equipments.filter(
            (eq) => eq.ctrId === data.id || eq.id.includes('TMP')
          );
          // Creation of the tasks with the current equipments
          if (this.workorder.tasks.length > 0) {
            this.workorder.tasks = this.workorder.tasks.filter((t) =>
              this.equipments.map((e) => e.id).includes(t.assObjRef) || t.assObjRef.includes('TMP')
            );
          }
          this.nbEquipments = this.equipments.length.toString();
          if (this.nbEquipments === '1') {
            this.getEquipmentLabel().then((label) => {
              this.equipmentName = label;
            });
          }

          if (this.workorder.ctrId.toString() !== this.contracts[0].id.toString()) {
            this.creationWkoForm.patchValue( { ctrId: this.contracts[0].id }, { emitEvent: true });
          }

          this.mapLayerService.fitBounds(
            this.equipments.map((eq) => {
              return [+eq.x, +eq.y];
            })
          );
        }
      }

      // Creation
      if (this.isCreation) {
        if (!this.isXY) {
          // The 'Pose' reason is only accessible to the XY asset so we filter it
          this.wtrs = this.wtrs.filter((wtr) => wtr.wtrCode !== WTR_CODE_POSE);
        } else {
          // The 'pose' reason does not exist for XY so we add it
          if (!this.wtrs.some((wtr) => wtr.wtrCode === WTR_CODE_POSE)) {
            this.wtrs.push({
              astCode: null,
              astSlabel: null,
              astLlabel: null,
              lyrTableName: null,
              wtrSlabel: 'Poser',
              wtrLlabel: 'Poser',
              wtrCode: WTR_CODE_POSE,
              wtrId: -1,
              astId: null,
              aswValid: null,
              aswUcreId: null,
              aswUmodId: null,
              aswDcre: null,
              aswDmod: null,
            });
          }

          this.layers = layers.filter(
            (layer) =>
              layer.domCode === this.params.waterType &&
              !layer.lyrTableName.includes('_xy')
          );
        }
      }

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

      await this.generateMarker();

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

  public async getEquipmentLabel(eq?: any): Promise<string> {
    const layers = await this.layerService.getAllLayers();
    const layer = layers.find(
      (l) => l.lyrTableName === `${(eq ?? this.equipments[0]).lyrTableName}`
    );
    return `${layer.lyrSlabel} - ${layer.domLLabel} `;
  }

  public getLayerLabel(layer: Layer): string {
    return layer.lyrSlabel;
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
              if (eq.geom?.coordinates) {
                geom = eq.geom.coordinates;
              } else {
                const equipt = await this.layerService.getEquipmentByLayerAndId(
                  eq.lyrTableName,
                  eq.id
                );
                geom = equipt.geom.coordinates;
              }
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
        CacheKey.WORKORDERS,
        this.workorder.id.toString()
      );
    }
  }

  private async initEquipmentsLayers(): Promise<void> {
    const currentAssets = this.equipments.filter(
      ({ lyrTableName }) => !lyrTableName.includes('_xy')
    );

    for (const asset of currentAssets) {
      await this.mapService.addEventLayer(asset.lyrTableName);
    }

    this.mapEvent.highlighSelectedFeatures(
      this.mapService.getMap(),
      currentAssets.map((eq: any) => {
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
    await this.workorderService.saveCacheWorkorder(this.workorder);
  }

  private async handleEditMode(): Promise<any[]> {
    this.isCreation = false;
    const wkoId = this.activatedRoute.snapshot.params['id'];
    if (wkoId) {
      this.workorder = await this.workorderService.getWorkorderById(
        Number(wkoId)
      );
      const xyTasksAndNewAssets = this.workorder.tasks
        .filter((t) => t.assObjRef == null || t.assObjRef.includes('TMP'))
        .map((t) => {
          return {
            id: t?.assObjRef ?? this.utils.createCacheId().toString(),
            lyrTableName: t.assObjTable,
            x: t.longitude,
            y: t.latitude,
            assetForSig: t.assetForSig,
            taskId: t.id,
          };
        });

      let assetsFromTasks = [];
      const transformedTasks = this.transformTasks(this.workorder.tasks);
      if (transformedTasks && transformedTasks.length > 0) {
        assetsFromTasks =
          await this.layerService.getEquipmentsByLayersAndIds(
            transformedTasks
          );
      }

      return [...xyTasksAndNewAssets, ...assetsFromTasks];
    } else {
      this.drawerService.navigateTo(DrawerRouteEnum.HOME);
      return [];
    }
  }

  private transformTasks(inputItems: any[]): any[] {
    const transformedItems: { [assObjTable: string]: string[] } = {};

    // Group items by assObjTable
    inputItems.forEach((item) => {
      if (!transformedItems[item.assObjTable]) {
        transformedItems[item.assObjTable] = [];
      }
      if (item.assObjRef) {
        transformedItems[item.assObjTable].push(item.assObjRef);
      }
    });

    // Transform grouped items into the desired format
    return Object.keys(transformedItems).map((assObjTable) => {
      return transformedItems[assObjTable]?.length > 0 ?
        {
          lyrTableName: assObjTable,
          equipmentIds: transformedItems[assObjTable],
        } : null;
    }).filter((item) => item !== null);
  }
}
