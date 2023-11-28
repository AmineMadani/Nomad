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
  switchMap,
  takeUntil,
  debounceTime,
  fromEvent,
  Subscription,
} from 'rxjs';
import { DateTime } from 'luxon';
import { MapService } from 'src/app/core/services/map/map.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { AlertController, IonModal, ModalController } from '@ionic/angular';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { CacheKey, CacheService } from 'src/app/core/services/cache.service';
import {
  Task,
  TravoUrlPayload,
  WkoStatus,
  Workorder, CreateWorkorderUrlPayload, isUrlFromTravo, isUrlFromTravoValid, UpdateWorkorderUrlPayload,
  WTR_CODE_POSE,
  WorkorderTaskStatus
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
import { MultiAssetsModalComponent } from '../multi-assets-modal/multi-assets-modal.component';
import { AssetForSigService } from 'src/app/core/services/assetForSig.service';
import { isNumber } from '@turf/turf';
import { LayerGrpAction } from 'src/app/core/models/layer-gp-action.model';

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
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private assetForSigService: AssetForSigService
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

  public assets: any[];

  public creationWkoForm: FormGroup;
  public currentUrlParams: TravoUrlPayload | CreateWorkorderUrlPayload | UpdateWorkorderUrlPayload;

  public currentContract: Contract;
  public currentStatus: string;

  public contracts: Contract[];
  public cities: City[];
  public wtrs: VLayerWtr[];
  public allWtrs: VLayerWtr[];
  public assetsDetails: any[] = [];
  public layers: Layer[];

  public nbAssets: string;

  public title: string;

  public workorder: Workorder;
  //En mode édition: représente l'état du workorder en base - permet de comparer les champs qui ont été modifiés
  public workorderInit: Workorder;
  public equipmentName: string;

  public isLoading: boolean = true;
  public addressLoading: boolean = false;

  public creationButonLabel: string;

  public alerteMessage = '';

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

  public autoGenerateLabel = true;

  async ngOnInit(): Promise<void> {
    this.createForm();

    this.title = 'Générer une intervention';
    this.creationButonLabel = this.defaultCreationLabel;

    // Check permissions
    this.userHasPermissionSendWorkorder =
      await this.userService.currentUserHasPermission(
        PermissionCodeEnum.SEND_WORKORDER
      );

    // Url parameters recuperation
    const paramsMap = new Map<string, string>(
      new URLSearchParams(window.location.search).entries()
    );
    // Build the current url param obj
    for (let [key, value] of paramsMap) {
      if (!this.currentUrlParams) {
        this.currentUrlParams = {};
      }

      this.currentUrlParams[key] = value;
    }

    this.mapService
      .onMapLoaded()
      .pipe(
        filter((isMapLoaded) => isMapLoaded),
        takeUntil(this.ngUnsubscribe$),
        switchMap(async () => {
          if (this.currentUrlParams) {
            // Handle travo case if necessary
            await this.checkAndSetParamsToHandleTravoUrl();

            // XY case
            if (this.currentUrlParams.lyrTableName) {
              this.isXY = true;
              return [];
            }
            // Other cases
            else {
              const params = this.utils.transformMap(paramsMap, true);
              return this.layerService.getEquipmentsByLayersAndIds(params);
            }
          } else {
            return this.handleEditMode();
          }
        })
      )
      .subscribe(async (assets: any) => {
        this.assets = assets;

        if (this.assets.length > 1) await this.checkEquipments();

        // Extract the temporary new asset from the url (when coming from multiple selection without a workorder)
        // Add them to the list of asset
        const urlParams = new URLSearchParams(window.location.search);
        let listAssObjRef = [];
        for (let [key, value] of Array.from(urlParams.entries()).filter(
          ([key]) => key === 'tmp'
        )) {
          const listValue = value.split(',');
          for (const v of listValue) {
            if (!listAssObjRef.includes(v)) listAssObjRef.push(v);
          }
        }
        for (const assObjRef of listAssObjRef) {
          const assetForSig =
            await this.assetForSigService.getCacheAssetForSigByAssObjRef(
              assObjRef
            );
          if (assetForSig != null) {
            this.assets.push({
              id: assObjRef,
              lyrTableName: assetForSig.assObjTable,
              x: assetForSig.coords[0][0],
              y: assetForSig.coords[0][1],
              assetForSig: assetForSig,
            });
          }
        }

        this.nbAssets = this.assets.length.toString();

        const wkoId = this.activatedRoute.snapshot.params['id'];

        // Creation Mode
        if (this.isCreation) {
          this.workorder = {
            id: this.utils.createCacheId(),
            isDraft: true,
            wkoAttachment: false,
            tasks: [],
          };
          if (!this.isXY) {
            this.workorder.tasks = this.assets.map((ast) => {
              return {
                id: this.utils.createCacheId(),
                assObjRef: ast.id,
                assObjTable: ast.lyrTableName,
                wtrId: null,
                longitude: ast.x,
                latitude: ast.y,
                assetForSig: ast.assetForSig,
              };
            });
          }
        }
        // Edit Mode
        else {
          if (wkoId > 0) {
            this.title = `Modification de l'intervention ${this.workorder.wkoName}`;
            this.createWithoutSendToPlanning =
              'Sans envoyer pour planification';
            this.creationButonLabel = 'Modifer';
          }

          await this.initializeFormWithWko();
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

    this.creationWkoForm
      .get('wkoAgentNb')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((agentNb: number) => {
        if (agentNb < 1) {
          this.creationWkoForm.patchValue(
            {
              wkoAgentNb: 1,
            },
            { emitEvent: false }
          );
        }
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
      wkoPlanningDuration : new FormControl(''),
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
      wkoAffair: new FormControl({
        value: '',
        disabled: true
      }, {
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
    this.creationWkoForm.addValidators(
      TimeValidator.compareTimeDurationValidatorWithTrigger(
        'wkoPlanningStartDate',
        'wkoPlanningEndDate',
        'wkoPlanningStartHour',
        'wkoPlanningEndHour',
        'wkoPlanningDuration',
        'wkoAppointment'
      )
    );

    this.creationWkoForm
      .get('wtrId')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((wtrId) => {
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

    //Generation de label
    this.creationWkoForm
      .get('wtrId')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.generateLabel();
      });
    this.creationWkoForm
      .get('ctrId')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.generateLabel();
      });
    this.creationWkoForm
      .get('ctyId')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.generateLabel();
      });
    this.creationWkoForm
      .get('wkoPlanningStartDate')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.generateLabel();
      });
    this.creationWkoForm
      .get('wkoName')
      .valueChanges.pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.autoGenerateLabel = false;
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
   * Set Default Duration on click
   */
  public setDefaultDuration(event: any) {
      if (!this.creationWkoForm.get('wkoPlanningDuration').value){
        this.creationWkoForm.get('wkoPlanningDuration').setValue('01:00');
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

  /**
   * Retourne vrai si les tasks sont différents
   * @param actualTasks
   * @param newTasks
   * @returns
   */
  public checkTasksChanged(newTasks: Task[]): boolean {
    let hasChanged = false;
    newTasks.forEach((task) => {
      if (task.id < 0) {
        hasChanged = true;
      }
    });
    return hasChanged;
  }

  /**
   * En édition, si les champs RDV, Contrat, Commune, Equipement, Nombre d'agent, Date , Motif sont modifiés
   * Afficher un message d'alerte prévenant la déplanification de l'intervention
   * @returns message d'alerte
   */
  public haveModifieldFieldUnscheduled(): boolean {
    let hasChanged: boolean = false;
    if (!this.isCreation && this.workorder != null && this.workorderInit) {
      if (
        this.workorder['wkoAppointment']?.toString() !=
        this.creationWkoForm.controls['wkoAppointment']?.toString() ||
        this.workorder['ctrId']?.toString() !=
        this.creationWkoForm.controls['ctrId']?.toString() ||
        this.workorder['ctyId']?.toString() !=
        this.creationWkoForm.controls['ctyId']?.toString() ||
        this.workorder['wkoAgentNb']?.toString() !=
        this.creationWkoForm.controls['wkoAgentNb']?.toString() ||
        this.checkTasksChanged(this.workorder.tasks)
      ) {
        this.alerteMessage =
          'Les éléments modifiés entrainent une déplanification dans le planificateur. Souhaitez-vous continuer ?';
        hasChanged = true;
      } else if (
        DateTime.fromISO(this.workorder.wkoPlanningStartDate as any).toFormat(
          'dd/MM/yyyy'
        ) !=
          DateTime.fromISO(
            this.creationWkoForm.controls['wkoPlanningStartDate'] as any
          ).toFormat('dd/MM/yyyy') ||
        DateTime.fromISO(this.workorder.wkoPlanningEndDate as any).toFormat(
          'dd/MM/yyyy'
        ) !=
          DateTime.fromISO(
            this.creationWkoForm.controls['wkoPlanningEndDate'] as any
          ).toFormat('dd/MM/yyyy') ||
        this.workorder.tasks[0]?.wtrId?.toString() !=
        this.creationWkoForm.controls['tasks'][0]?.wtrId?.toString()
      ) {
        this.alerteMessage =
          'Les éléments modifiés pourraient entrainer une déplanification dans le planificateur. Souhaitez-vous continuer ?';
        hasChanged = true;
      }
    }
    return hasChanged;
  }

  public async onSubmit(): Promise<void> {
    this.creationWkoForm.markAllAsTouched();
    if (!this.creationWkoForm.valid) {
      return;
    }

    this.isLoading = true;
    const { wtrId, ...form } = this.creationWkoForm.value;

    let assets = [];

    if (this.assets.length > 0) {
      assets = this.assets?.map((ast) => {
        return {
          assObjRef: this.isXY ? undefined : ast.id,
          assObjTable: ast.lyrTableName,
          wtrId: wtrId,
          longitude: ast.x,
          latitude: ast.y,
          assetForSig: ast.assetForSig,
          taskId: ast?.taskId,
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
    this.workorder.wkoPlanningDuration =this.utils.convertStringToNumber(form.wkoPlanningDuration);

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
    if (this.workorderInit) {
      this.workorder.wtsId = this.workorderInit['wtsId'];
    }

    // Creation - Case of a 'Pose' reason on a XY asset
    if (this.isCreation && this.isXY && wtrId === -1) {
      // Change the task to be on the asset selected
      const task = this.workorder.tasks[0];
      task.assObjTable = form.lyrTableName;
      task.assObjRef = null;

      // Change the reason to be the 'Pose' reason of the layer selected
      const wtr = this.allWtrs.find(
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

      // Redirect to travo if necessary.
      await this.redirectToTravoAfterSave(res);

      if (!res.syncOperation) {
        this.workorderService.deleteCacheWorkorder(this.workorder);
      }
    });
  }

  /**
   * En mode édition, affiche un message si l'intervention doit être déplanifié
   */
  public async onValidate(): Promise<void> {
    if (!this.isCreation
      && (this.workorder.wtsId === WkoStatus.ENVOYEPLANIF )
      && this.haveModifieldFieldUnscheduled()
    ) {
      const alert = await this.alertController.create({
        header: 'Attention !',
        subHeader: this.alerteMessage,
        cssClass: 'custom-alert-wko',
        buttons: [
          {
            text: 'Non',
            role: 'cancel',
            handler: () => {
              //ne rien faire
            },
          },
          {
            text: 'Oui',
            role: 'confirm',
            handler: () => {
              this.wkoExtToSyncValue= true;
              this.onSubmit();
            },
          },
        ],
      });

      await alert.present();
    }
    else {
      this.onSubmit();
    }
  }

  public onCreationModeChange(event: any): void {
    if (event.target.value === 'CREE') {
      this.wkoExtToSyncValue = false;
      this.creationButonLabel = this.createWithoutSendToPlanning;
    } else if (event.target.value === 'CREEAVECENVOIE') {
      this.creationButonLabel = this.defaultCreationLabel;
      this.wkoExtToSyncValue = true;
    }
    this.onValidate();
  }

  public async openEquipmentModal(): Promise<void> {
    if (this.assetsDetails.length === 0) {
      // Create an array of observables for each call to getEquipmentLabel
      const promisesArray = this.assets.map((ast) =>
        this.getEquipmentLabel(ast).then((equipmentLabel) => {
          this.assetsDetails.push([equipmentLabel, ast.id, ast.lyrTableName]);
        })
      );

      // Use promise.all to run all observables in parallel
      Promise.all(promisesArray).then(() => {
        if (this.assets?.[0] !== null && this.assets.length >= 1) {
          this.equipmentModal.present();
        }
        if (this.equipmentModal.isOpen) {
          this.equipmentModal.dismiss();
        }
      });
    } else {
      // If assetsDetails is not empty, just open the modal
      if (this.assets?.[0] !== null && this.assets.length >= 1) {
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
      this.assets,
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
        }
        else if (key == 'wkoPlanningDuration' &&  isNumber(this.workorder[key]) && Number(this.workorder[key]) > 0 ) {
          this.creationWkoForm.get('wkoPlanningDuration').setValue(this.utils.convertNumberToTimeString(this.workorder[key]));
        }
        else {
          control.setValue(this.workorder[key], { emitEvent: false });
        }
      }
    });

    //set WTR
    this.creationWkoForm.get('wtrId').setValue(this.workorder.tasks[0]?.wtrId);

    this.workorderService
      .getAllWorkorderTaskStatus()
      .then((status: WorkorderTaskStatus[]) => {
        this.currentStatus = status.find(
          (s) => s.id === this.workorder.wtsId
        )?.wtsLlabel;
      });
  }

  private async initializeEquipments(): Promise<void> {
    let contractsIds: number[];
    let cityIds: number[];
    if (!this.isXY) {
      // WKO Assets
      // If mono-equipment, we need the equipment name
      if (this.assets.length === 1) {
        this.getEquipmentLabel().then((label: string) => {
          this.equipmentName = label;
        });
      }

      // Ctr and Cty are on the assets
      contractsIds = this.assets
        .map((ast) => ast?.ctrId ?? +this.workorder.ctrId)
        .filter((ctrId) => !isNaN(ctrId));

      cityIds = this.assets
        .map((ast) => ast?.ctyId ?? +this.workorder.ctyId)
        .filter((ctyId) => !isNaN(ctyId));

      // If there is no contracts
      if (contractsIds.length === 0) {
        // If there is only 1 asset
        if (this.assets.length === 1) {
          const equipment = this.assets[0];
          // And this asset this a new asset
          if (equipment.id != null && equipment.id.startsWith('TMP-')) {
            // Get the list of contract for this X/Y
            contractsIds =
              await this.contractService.getContractIdsByLatitudeLongitude(
                equipment.y,
                equipment.x
              );
          }
        }
      }

      // If there is no cities
      if (cityIds.length === 0) {
        // If there is only 1 asset
        if (this.assets.length === 1) {
          const equipment = this.assets[0];
          // And this asset this a new asset
          if (equipment.id && equipment.id.startsWith('TMP-')) {
            // Get the list of cities for this X/Y
            cityIds = await this.cityService.getCityIdsByLatitudeLongitude(
              equipment.y,
              equipment.x
            );
          }
        }
      }
    } else {
      // WKO XY
      this.assets = [
        {
          id: this.utils.createCacheId().toString(),
          lyrTableName: this.currentUrlParams.lyrTableName,
          x: this.currentUrlParams.x,
          y: this.currentUrlParams.y,
          assetForSig: undefined,
          taskId: undefined,
          isXY: true,
        },
      ];

      // Get the current layer with lyrTableName
      const layers = await this.layerService.getAllLayers();
      const layer = layers.find(
        (l: Layer) => l.lyrTableName === this.currentUrlParams.lyrTableName
      );

      this.equipmentName = `XY - ${layer.domLLabel}`;

      // Ctr and Cty are from the XY
      contractsIds =
        await this.contractService.getContractIdsByLatitudeLongitude(
          this.currentUrlParams.y,
          this.currentUrlParams.x
        );
      cityIds = await this.cityService.getCityIdsByLatitudeLongitude(
        this.currentUrlParams.y,
        this.currentUrlParams.x
      );
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
        this.currentUrlParams?.x ?? this.assets[0].x,
        this.currentUrlParams?.y ?? this.assets[0].y
      )
      .then((addresse) =>
        this.creationWkoForm.patchValue(
          {
            wkoAddress: addresse.features[0]?.properties['label'],
          },
          { emitEvent: false }
        )
      );

    const results = await Promise.all([
      this.layerService.getAllVLayerWtr(),
      this.contractService.getAllContracts(),
      this.cityService.getAllCities(),
      this.layerService.getAllLayers(),
      this.layerService.getAllLayerGrpActions(),
    ]);

    const freasons: VLayerWtr[] = results[0];
    const contracts: Contract[] = results[1];
    const cities: City[] = results[2];
    const layers: Layer[] = results[3];
    const layerGrpActions: LayerGrpAction[] = results[4];

    const lyrTableNames = this.assets.map((ast) => ast.lyrTableName);

    let reasons = freasons.filter((vlw: VLayerWtr) =>
      lyrTableNames.includes(vlw.lyrTableName)
    );

    const isMultiEquipmentAndLayers = [...new Set(lyrTableNames)];

    const wtrPossibles = [];
    if (isMultiEquipmentAndLayers.length > 1 && layerGrpActions.length > 0) {
      for (const lyrGrpAct of layerGrpActions) {
        if (
          lyrTableNames.every((ltn) => lyrGrpAct.lyrTableNames.includes(ltn))
        ) {
          wtrPossibles.push(lyrGrpAct.wtrCode);
        }
      }
      if (wtrPossibles.length > 0) {
        reasons = reasons.filter((wtr) => wtrPossibles.includes(wtr.wtrCode));
      }
    }

    this.wtrs = this.utils.removeDuplicatesFromArr(reasons, 'wtrId');

    const selectedWtrId = this.creationWkoForm.get('wtrId').value;
    if (this.wtrs.length === 1 && this.wtrs[0].wtrId !== selectedWtrId) {
      this.creationWkoForm.patchValue(
        { wtrId: this.wtrs[0].wtrId },
        { emitEvent: false }
      );
    } else if (!this.wtrs.some((v) => v.wtrId === selectedWtrId)) {
      this.creationWkoForm.patchValue(
        { wtrId: undefined },
        { emitEvent: false }
      );
    }

    this.allWtrs = this.utils.removeDuplicatesFromArr(freasons, 'wtrId');
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

    this.contracts = contracts.filter((c) => this.isCreation ? (contractsIds.includes(c.id) && !c.ctrExpired) : contractsIds.includes(c.id));
    this.cities = cities.filter((c) => cityIds.includes(c.id));

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

        // Get layers for the right domains without the xy ones
        // The domCode recuperation is not smart as all
        const domCode = this.currentUrlParams.lyrTableName.includes('aep') ? 'dw' : 'ww';
        this.layers = layers.filter(
          (layer) =>
            layer.domCode === domCode &&
            !layer.lyrTableName.includes('_xy')
        );
      }
    }

    // We don't want to erase possible draft entries
    if (
      this.creationWkoForm.controls['ctyId'].value?.length === 0 ||
      !cityIds.includes(this.creationWkoForm.controls['ctyId'].value)
    ) {
      this.creationWkoForm.controls['ctyId'].setValue(
        cityIds.length === 1
          ? cityIds[0]
          : this.utils.findMostFrequentValue(cityIds)
      );
    }

    if (
      this.creationWkoForm.controls['ctrId'].value?.length === 0 ||
      !contractsIds.includes(this.creationWkoForm.controls['ctrId'].value)
    ) {
      this.creationWkoForm.controls['ctrId'].setValue(
        contractsIds.length === 1
          ? contractsIds[0]
          : this.utils.findMostFrequentValue(contractsIds)
      );
    }

    await this.generateMarker();

    this.isLoading = false;

    // We listen to the changes only after the form is set
    this.listenToFormChanges();

    // We precomplete form info if it's a travo url
    await this.initializeFormWithTravoInfo();
  }

  public getContractLabel(contract: any): string {
    return contract.ctrLlabel;
  }
  public getContractStyle (contract: any) : string {
    return contract.ctrExpired ? 'Expired' : null;
  }
  public getContractDisable(contract: any) : Boolean {
    return contract.ctrExpired;
  }
  public getCityLabel(city: any): string {
    return city.ctyLlabel;
  }

  public getWtrLabel(reason: any): void {
    return reason.wtrLlabel;
  }

  public async getEquipmentLabel(ast?: any): Promise<string> {
    const layers = await this.layerService.getAllLayers();
    const layer = layers.find(
      (l) => l.lyrTableName === `${(ast ?? this.assets[0]).lyrTableName}`
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
    let index: number = 0;
    for (const ast of this.assets) {
      if (!this.mapService.hasEventLayer(ast.lyrTableName)) {
        await this.mapService.addEventLayer(ast.lyrTableName);
      }
      if (!this.markerCreation.has(ast.id)) {
        // We don't need to recalculate the coords for a point because it has only one x and y.
        if (ast.geom.type !== 'Point') {
          const recalculateCoords = this.mapLayerService.findNearestPoint(
            ast.geom.coordinates,
            [
              ast.x,
              ast.y,
            ]
          );
          ast.x = recalculateCoords[0];
          ast.y = recalculateCoords[1];
        }
        if (ast.id.startsWith('TMP-')) {
          this.markerCreation.set(
            ast.id,
            this.mapLayerService.addMarker(ast.x, ast.y, [ast.x, ast.y], true)
          );
        } else {
          if (this.isXY) {
            this.markerCreation.set(
              ast.id,
              this.mapLayerService.addMarker(
                this.currentUrlParams.x,
                this.currentUrlParams.y,
                [this.currentUrlParams.x, this.currentUrlParams.y],
                true
              )
            );
          } else {
            let geom = undefined;
            if (!ast.lyrTableName.includes('_xy')) {
              if (ast.geom?.coordinates) {
                geom = ast.geom.coordinates;
              } else {
                const equipt = await this.layerService.getEquipmentByLayerAndId(
                  ast.lyrTableName,
                  ast.id
                );
                geom = equipt.geom.coordinates;
              }
            }
            this.markerCreation.set(
              ast.id,
              this.mapLayerService.addMarker(
                ast.x,
                ast.y,
                geom ?? [ast.x, ast.y],
                geom ? false : true,
                index === 0 ? 'red' : ''
              )
            );
          }
        }
      }
      this.markerSubscription.set(
        ast.id,
        fromEvent(this.markerCreation.get(ast.id), 'dragend').subscribe(() => {
          ast.x = this.markerCreation.get(ast.id).getLngLat().lng;
          ast.y = this.markerCreation.get(ast.id).getLngLat().lat;
        })
      );
      if (index === 0) {
        this.markerSubscription.set(
          `${ast.id}-address`,
          fromEvent(this.markerCreation.get(ast.id), 'dragend').subscribe(
            async () => {
              this.addressLoading = true;
              const address = await this.cityService.getAdressByXY(
                this.markerCreation.get(ast.id).getLngLat().lng,
                this.markerCreation.get(ast.id).getLngLat().lat
              );
              this.creationWkoForm.patchValue(
                {
                  wkoAddress: address.features[0]?.properties['label'],
                },
                { emitEvent: false }
              );
              this.addressLoading = false;
            }
          )
        );
      }
      index++;
    }

    this.mapEvent.highlighSelectedFeatures(
      this.mapService.getMap(),
      this.assets
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
    const currentAssets = this.assets.filter(
      ({ lyrTableName }) => !lyrTableName.includes('_xy')
    );

    for (const asset of currentAssets) {
      await this.mapService.addEventLayer(asset.lyrTableName);
    }

    this.mapEvent.highlighSelectedFeatures(
      this.mapService.getMap(),
      currentAssets.map((ast: any) => {
        return { id: ast.id, source: ast.lyrTableName };
      })
    );

    this.mapLayerService.fitBounds(
      this.assets.map((ast) => {
        return [+ast.x, +ast.y];
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
    const duration =  this.utils.convertStringToNumber(this.creationWkoForm.value['wkoPlanningDuration']);
    if (duration > 0 ){
      this.workorder.wkoPlanningDuration = duration
    }
    await this.workorderService.saveCacheWorkorder(this.workorder);
  }

  private async handleEditMode(): Promise<any[]> {
    this.isCreation = false;
    const wkoId = this.activatedRoute.snapshot.params['id'];
    if (wkoId) {
      this.workorder = await this.workorderService.getWorkorderById(
        Number(wkoId)
      );
      if (
        Number(wkoId) > 0 ) {
        this.workorderInit = { ...this.workorder };
      }
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
        assetsFromTasks = await this.layerService.getEquipmentsByLayersAndIds(
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
    return Object.keys(transformedItems)
      .map((assObjTable) => {
        return transformedItems[assObjTable]?.length > 0
          ? {
            lyrTableName: assObjTable,
            equipmentIds: transformedItems[assObjTable],
          }
          : null;
      })
      .filter((item) => item !== null);
  }

  private async checkEquipments(): Promise<void> {
    const layers = await this.layerService.getAllLayers();
    // Checking if we have a mix of dw/ww assets
    const isMultiWater =
      [
        // Removing duplicates
        ...new Set(
          // Finding the differents dom codes for the current layers
          layers
            .filter((l: Layer) => {
              if (
                this.assets
                  .map((ast) => ast.lyrTableName)
                  .includes(l.lyrTableName)
              ) {
                return true;
              } else {
                return false;
              }
            })
            .map((l) => l.domCode)
        ),
      ].length === 2;

    // Checking if the assets are on more than one contract
    const isMultiContract =
      [...new Set(this.assets.map((ast) => ast.ctrId))].length > 1;

    // Checking if there is a difference between assets GEOMs
    const isMultiGeomType =
      [
        ...new Set(
          layers
            .filter((l: Layer) =>
              this.assets
                .map((ast) => ast.lyrTableName)
                .includes(l.lyrTableName)
            )
            .map((l) => l.lyrGeomType)
        ),
      ].length > 1;

    if (isMultiGeomType || isMultiWater || isMultiContract) {
      const modal = await this.modalCtrl.create({
        component: MultiAssetsModalComponent,
        componentProps: {
          isMultiGeomType,
          isMultiWater,
          isMultiContract,
          assets: this.assets,
        },
        backdropDismiss: false,
      });
      modal.present();

      const { data } = await modal.onWillDismiss();

      if (data) {
        this.assets = data;

        // Removing the tasks that do not comply anymore with the current assets
        if (this.workorder?.tasks.length > 1) {
          this.workorder.tasks = this.workorder.tasks.filter((t) =>
            this.assets.map((ast) => ast.id).includes(t.assObjRef)
          );
        }
      }
    }
  }

  /**
   * If all required control are set
   * generate label
   */
  public async generateLabel() {
    if (
      this.autoGenerateLabel &&
      this.isCreation &&
      this.creationWkoForm.controls['ctrId'].status == 'VALID' &&
      this.creationWkoForm.controls['ctyId'].status == 'VALID' &&
      this.creationWkoForm.controls['wtrId'].status == 'VALID' &&
      this.creationWkoForm.controls['wkoPlanningStartDate'].status == 'VALID'
    ) {
      let contratId = this.creationWkoForm.controls['ctrId'].value;
      let cityId = this.creationWkoForm.controls['ctyId'].value;
      let actionId = this.creationWkoForm.controls['wtrId'].value;
      let user = await this.userService.getCurrentUser();
      let separator = '_';

      let contratLabel = this.contracts.find(
        (ctr) => ctr.id.toString() == contratId
      ).ctrSlabel;
      let cityLabel = this.cities.find(
        (ctr) => ctr.id.toString() == cityId
      ).ctySlabel;
      let actionLabel = this.wtrs.find(
        (wtr) => wtr.wtrId.toString() == actionId
      ).wtrSlabel;

      let label =
        user.firstName.slice(0, 1) +
        user.lastName.slice(0, 1) +
        separator +
        this.creationWkoForm.controls['wkoPlanningStartDate'].value +
        separator +
        actionLabel +
        separator +
        contratLabel +
        separator +
        cityLabel;
      this.creationWkoForm.controls['wkoName'].setValue(label.toUpperCase());
      this.autoGenerateLabel = true;
    }
  }

  // ### Travo management methods ### ///
  // http://localhost:8100/home/workorder?x=2.7040775629933194&y=48.41150005974143&wkoAffair=coucou&astCode=23&wtrCode=20&wkoName=salut&wkoCreationComment=cmagnifique&callbackUrl=encore&ctrCode=E4221&wkoPlanningStartDate=06%2F07%2F2001&wkoPlanningEndDate=06%2F08%2F2001

  private async checkAndSetParamsToHandleTravoUrl(): Promise<void> {
    // Set params if we are on travo url
    // It permits to set the lyrTableName properly
    if (isUrlFromTravo(this.currentUrlParams)) {
      // Check if all necessary parameters are provided
      if (isUrlFromTravoValid(this.currentUrlParams)) {
        // We start by set the wkoAffair field required
        this.creationWkoForm.get('wkoAffair').setValidators([Validators.required]);

        const travoParams = this.currentUrlParams as TravoUrlPayload;

        // Get layers to show on the map from the astCode
        const layers = await this.layerService.getAllLayers();
        const astLayers = layers.filter((layer) => layer.astCode === travoParams.astCode);
        for (let layer of astLayers) {
          await this.mapService.addEventLayer(layer.lyrTableName);
        }

        // All travo workorder is by default an xy
        // We get the current domCode from the first layer because an astCode can't be on 2 different domains.
        if (astLayers[0].domCode === 'dw') {
          this.currentUrlParams.lyrTableName = 'aep_xy';
        } else {
          this.currentUrlParams.lyrTableName = 'ass_xy';
        }
      } else {
        this.utils.showErrorMessage("Certains paramètres obligatoires n'ont pas été renseigné par Travo.", 5000);
        this.drawerService.navigateTo(DrawerRouteEnum.HOME);
        throw new Error("Certains paramètres obligatoires n'ont pas été renseigné par Travo.");
      }
    }
  }

  private async initializeFormWithTravoInfo(): Promise<void> {
    if (this.workorder.tempTravoWtrId) {
      this.creationWkoForm.get('wtrId').setValue(this.workorder.tempTravoWtrId);
      this.creationWkoForm.updateValueAndValidity();
      this.workorder.tempTravoWtrId = undefined;
    }

    if (isUrlFromTravo(this.currentUrlParams)) {
      const travoInfo: TravoUrlPayload = this.currentUrlParams;

      if (travoInfo.wkoName) {
        this.creationWkoForm.get('wkoName').setValue(travoInfo.wkoName);
      }

      if (travoInfo.wkoPlanningStartDate) {
        this.creationWkoForm.get('wkoPlanningStartDate').setValue(travoInfo.wkoPlanningStartDate);
      }

      if (travoInfo.wkoPlanningEndDate) {
        this.creationWkoForm.get('wkoPlanningEndDate').setValue(travoInfo.wkoPlanningEndDate);
      }

      if (travoInfo.wkoCreationComment) {
        this.creationWkoForm.get('wkoCreationComment').setValue(travoInfo.wkoCreationComment);
      }

      if (travoInfo.ctrCode) {
        this.creationWkoForm.get('ctrId').setValue(
          this.contracts.find((ctr) => ctr.ctrCode === travoInfo.ctrCode)?.id
        );
      }

      if (travoInfo.wkoAffair) {
        this.creationWkoForm.get('wkoAffair').setValue(travoInfo.wkoAffair);
      }

      // Workorder task reason
      const wtrIdInExistingList = this.wtrs.find((wtr) => wtr.wtrCode === travoInfo.wtrCode)?.wtrId;
      if (wtrIdInExistingList) {
        this.creationWkoForm.get('wtrId').setValue(wtrIdInExistingList);
      } else {
        // We enter in the case where the xy asset doesn't include the wtrCode of the asset provide in the url
        // So we stock a temp travo wtr id, and we will use it then to complete the automatically the type when a new equipment selected.
        const wtrIdInAllList = this.allWtrs.find((wtr) => wtr.wtrCode === travoInfo.wtrCode && wtr.astCode === travoInfo.astCode)?.wtrId;
        this.workorder.tempTravoWtrId = wtrIdInAllList;
      }

      // Callback url, stock directly in workorder to retrieve it during the save
      // Even if the user changed of page during the creation process
      this.workorder.travoCallbackUrl = travoInfo.callbackUrl;
    }
  }

  private async redirectToTravoAfterSave(res: Workorder) {
    const cachedWorkorder = await this.workorderService.getWorkorderById(this.workorder.id);
    if (cachedWorkorder.travoCallbackUrl) {
      this.utils.showSuccessMessage("Redirection vers Travo en cours...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!res.syncOperation) {
        this.workorderService.deleteCacheWorkorder(this.workorder);
      }

      window.location.href = cachedWorkorder.travoCallbackUrl;
    }
  }
}
