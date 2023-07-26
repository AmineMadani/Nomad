import { Component, Input, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Params, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogService } from 'src/app/core/services/dialog.service';
import { DatepickerComponent } from 'src/app/shared/components/datepicker/datepicker.component';
import { Subject, filter, takeUntil, tap } from 'rxjs';
import { DateTime } from 'luxon';
import { DatePipe } from '@angular/common';
import { MapService } from 'src/app/core/services/map/map.service';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { ExploitationDataService } from 'src/app/core/services/dataservices/exploitation.dataservice';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { IonModal } from '@ionic/angular';
import { MapEventService } from 'src/app/core/services/map/map-event.service';
import { v4 as uuidv4 } from 'uuid';
import { CacheService } from 'src/app/core/services/cache.service';
import { CustomWorkOrder } from 'src/app/core/models/workorder.model';

@Component({
  selector: 'app-wko-creation',
  templateUrl: './wko-creation.component.html',
  styleUrls: ['./wko-creation.component.scss'],
})
export class WkoCreationComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    private layerService: LayerService,
    private dialogService: DialogService,
    private mapService: MapService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private drawerService: DrawerService,
    private mapEvent: MapEventService,
    private cacheService: CacheService,
    private exploitationDateService: ExploitationDataService,
    private datePipe: DatePipe
  ) {}

  @ViewChild('equipmentModal', { static: true })
  public equipmentModal: IonModal;

  @Input() equipments: any[];

  public workOrderForm: FormGroup;
  public params: any;
  public wtrIds: any;
  public idList: string;
  public draftId: string;

  private markerCreation: Map<string, any> = new Map();

  private ngUnsubscribe$: Subject<void> = new Subject<void>();

  async ngOnInit(): Promise<void> {
    this.draftId = this.activatedRoute.snapshot.queryParams['draft'];
    this.createForm();

    if (this.draftId) {
      await this.initializeFormWithDraft();
    }
    await this.initializeEquipments();

    this.generateMarker();
  }

  ngAfterViewInit(): void {
    this.router.events
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        filter(
          (e): e is NavigationStart =>
            e instanceof NavigationStart &&
            !e.url.includes('/home/selection') &&
            !e.url.includes('/home/work-order') &&
            this.activatedRoute.snapshot.queryParams['draft']
        ),
      )
      .subscribe(() => {
        this.deleteDraft();
      });
  }

  ngOnDestroy(): void {
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
      .pipe(filter((dts: DateTime[]) => dts && (dts.length === 1 || dts.length === 2)))
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

  public onSubmit(): void {
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
    form.wkoPlanningStartDate = this.datePipe.transform(new Date(year, month - 1, day),'yyyy-MM-dd');
    [day, month, year] = form.wkoPlanningEndDate.split('-');
    form.wkoPlanningEndDate = this.datePipe.transform(new Date(year, month - 1, day),'yyyy-MM-dd');
    form.tasks = assets;
    form.latitude =
      assets?.[0].latitude ?? this.markerCreation.get('xy').getLngLat().lat;
    form.longitude =
      assets?.[0].longitude ?? this.markerCreation.get('xy').getLngLat().lng;

    this.exploitationDateService.createWorkOrder(form).subscribe((res:CustomWorkOrder) => {
      this.removeMarkers();
      this.layerService.addGeojsonToLayer(res, 'workorder');
      this.drawerService.navigateTo(DrawerRouteEnum.WORKORDER, [res.tasks[0].id], {
        lyr_table_name: 'workorder',
      });
    });
  }

  public openEquipmentModal(): void {
    if (this.equipments?.[0] !== null && this.equipments.length >= 1) {
      this.equipmentModal.present();
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
      uuid
    );
  }

  public getKeys(errors: any): string[] {
    return Object.keys(errors);
  }

  private async initializeFormWithDraft(): Promise<void> {
    const wkoDraft = await this.cacheService.getObjectFromCache(
      'draftwko',
      this.draftId
    );

    Object.keys(wkoDraft.data).forEach((key) => {
      const control = this.workOrderForm.get(key);
      if (control) {
        control.setValue(wkoDraft.data[key]);
      }
    });
  }

  private async initializeEquipments(): Promise<void> {
    // Wko Asset
    if (this.equipments[0] !== null) {
      this.idList = this.equipments
        .filter((eq) => eq !== null)
        .map((eq) => eq.id)
        .join(', ');
      this.wtrIds = {
        wtr_id: (
          await this.cacheService.getWtrByLyrTables(
            this.equipments.map((eq) => eq.lyr_table_name ?? eq.source)
          )
        )
          .map((wtr) => wtr.wtr_id)
          .join(','),
      };
    } else {
      // Wko XY
      this.params = { ...this.activatedRoute.snapshot.queryParams };
    }
  }

  /**
   * Generate a marker on the map.
   * Case 1 : Marker on the equipment and only draggable on it
   * Case 2 : Marker on the map and draggable on all the map. Update the params if the position change (city&contract)
   */
  private async generateMarker(): Promise<void> {
    // Asset WKO
    if (this.equipments?.[0] !== null) {
      for (let eq of this.equipments) {
        if (!this.mapService.hasEventLayer(eq.lyr_table_name)) {
          await this.mapService.addEventLayer(eq.lyr_table_name);
        }
        if (!this.markerCreation.has(eq.id)) {
          const geom = await this.layerService.getCoordinateFeaturesById(
            eq.lyr_table_name,
            eq.id
          );
          this.markerCreation.set(
            eq.id,
            this.layerService.addMarker(eq.x, eq.y, geom)
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
          this.layerService.addMarker(
            this.params.x,
            this.params.y,
            [this.params.x, this.params.y],
            true
          )
        );
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
}
