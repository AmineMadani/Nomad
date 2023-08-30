import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'src/app/core/services/dialog.service';
import { DatepickerComponent } from 'src/app/shared/components/datepicker/datepicker.component';
import { Subject, filter, map, switchMap, takeUntil, of, forkJoin, Observable, tap } from 'rxjs';
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
import { UtilsService } from 'src/app/core/services/utils.service';
import { LayerService } from 'src/app/core/services/layer.service';
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
    private datePipe: DatePipe,
    private userService: UserService,
    private cityService: CityService,
    private contractService: ContractService
  ) {}

  @ViewChild('equipmentModal', { static: true })
  public equipmentModal: IonModal;

  public equipments: any[];

  public workOrderForm: FormGroup;
  public params: any;

  public contracts: Contract[];
  public cities: City[];
  public wtrs: VLayerWtr[];
  public equipmentsDetails: any[] = [];

  public nbEquipments: string;
  public draftId: string;

  public title : string;

  public workOrder : Workorder;
  public equipmentName: string;

  public isLoading: boolean = true;

  // Permissions
  public userHasPermissionSendWorkorder: boolean = false;

  private markerCreation: Map<string, any> = new Map();
  private markerDestroyed: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  async ngOnInit(): Promise<void> {
    this.title = 'Générer une intervention';

    this.userHasPermissionSendWorkorder =
      await this.userService.currentUserHasPermission(PermissionCodeEnum.SEND_WORKORDER);

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

        this.draftId = this.activatedRoute.snapshot.queryParams['draft'];
        const wkoId = this.activatedRoute.snapshot.queryParams['wkoId'];
        this.createForm();


        if (this.draftId){
          await this.initializeFormWithDraft();
        }

        await this.initializeEquipments();

        this.generateMarker();

        if (wkoId){
          this.workOrder = await this.workOrderService.getWorkorderById(Number(wkoId));
          this.title = 'Modification de l\'intervention ' + this.workOrder.wkoName;
          await this.initializeFormWithWko();
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
      wkoEmergency: new FormControl(false),
      wkoAppointment: new FormControl(false),
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
          assObjTable: eq.lyrTableName,
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


      let funct : any;
      if(this.workOrder){
        form.id = this.workOrder.id;
        this.workOrder.latitude = form.latitude
        this.workOrder.longitude = form.longitude
        this.workOrder.wkoAddress = form.wkoAddress
        this.workOrder.wkoAgentNb = form.wkoAgentNb
        this.workOrder.wkoAppointment = form.wkoAppointment
        this.workOrder.wkoEmergency = form.wkoEmergency
        this.workOrder.wkoName = form.wkoName
        this.workOrder.wkoPlanningEndDate = form.wkoPlanningEndDate
        this.workOrder.wkoPlanningStartDate = form.wkoPlanningStartDate
        this.workOrder.wkoCreationComment = form.wkoCreationComment;
        //Récupération des équipements - réassigne l'id des task existantes
        this.workOrder.tasks.forEach(task => {
          let findTask = form.tasks.find(newTask => newTask.assObjRef == task.assObjRef);
          if (findTask && task.id){
            findTask.id = task.id;
          }
        })
        this.workOrder.tasks = form.tasks;
        this.workOrder.ctrId = form.ctrId;
        this.workOrder.ctyId = form.ctyId;
        funct =  this.workOrderService.updateWorkOrder(this.workOrder);
      }
      else{
        funct = this.workOrderService.createWorkOrder(form);
      }
      funct.subscribe((res: Workorder) => {
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
      // Create an array of observables for each call to getEquipmentLabel
      const observablesArray = this.equipments.map(eq =>
        this.getEquipmentLabel(eq).pipe(
          tap(equipmentLabel => {
            this.equipmentsDetails.push([equipmentLabel, eq.id, eq.lyrTableName]);
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
    if (this.workOrder){
      this.drawerService.navigateWithEquipments(
        DrawerRouteEnum.SELECTION,
        this.equipments,
        { wkoId: this.workOrder.id }
      );
    }
    else{
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

  private async initializeFormWithWko() : Promise<void>{
    Object.keys(this.workOrder).forEach((key) => {
      const control = this.workOrderForm.get(key);
      if (control) {
        if (this.workOrder[key] != null){
          if (key == 'wkoPlanningStartDate' || key == 'wkoPlanningEndDate'){
            control.setValue(this.datePipe.transform(this.workOrder[key], 'dd-MM-yyyy'));
          }
          else{
            control.setValue(this.workOrder[key].toString());
          }
        }
        else{
          control.setValue(this.workOrder[key]);
        }
      }
    });

    //set WTR
    this.workOrderForm.controls['wtrId'].setValue(this.workOrder.tasks[0].wtrId.toString());
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
    if (this.equipments.length > 0 && this.equipments[0] !== null) {
      this.nbEquipments = this.equipments.length.toString();

      // WKO Assets
      await this.initEquipmentsLayers();
      // If mono-equipment, we need the equipment name
      if (this.equipments.length === 1) {
        this.getEquipmentLabel().subscribe(label => {
          this.equipmentName = label;
        });
      }

      // Ctr and Cty are on the equipments
      const contractsIds: number[] = this.equipments.map((eq) => eq.ctrId);
      const cityIds: number[] = this.equipments.map((eq) => eq.ctyId);

      // Get referentials data
      this.fetchReferentialsData(contractsIds, cityIds);
    } else {
      // WKO XY
      this.params = { ...this.activatedRoute.snapshot.queryParams };

      // Ctr and Cty are from the URL
      const contractsIds: number[] = this.params.ctrId.split(',').map((c: string) => +c);
      const cityIds: number[] = this.params.ctyId.split(',').map((c: string) => +c);

      // Get referentials data
      this.fetchReferentialsData(contractsIds, cityIds);
    }
  }

  private fetchReferentialsData(contractsIds: number[], cityIds: number[]): void {
    forkJoin({
      reasons: this.layerService.getAllVLayerWtr(),
      contracts: this.contractService.getAllContracts(),
      cities: this.cityService.getAllCities(),
    }).subscribe(({ reasons, contracts, cities }) => {
      this.wtrs = this.utils.removeDuplicatesFromArr(reasons, 'wtrId');
      this.contracts = contracts.filter((c) => contractsIds.includes(c.id));
      this.cities = cities.filter((c) => cityIds.includes(c.id));

      // We don't want to erase possible draft entries
      if (this.workOrderForm.controls['ctyId'].value?.length === 0) {
        this.workOrderForm.controls['ctyId'].setValue(
          this.utils.findMostFrequentValue(cityIds)
        );
      }

      if (this.workOrderForm.controls['ctrId'].value?.length === 0) {
        this.workOrderForm.controls['ctrId'].setValue(
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
      map(layersRef => {
        const layer = layersRef.find(
          l => l.lyrTableName === `asset.${(eq ?? this.equipments[0]).lyrTableName}`
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
