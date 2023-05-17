import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs/internal/observable/of';
import { from } from 'rxjs/internal/observable/from';
import { ActivatedRoute } from '@angular/router';
import { SynthesisButton } from '../synthesis.drawer';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { LayerReferencesService } from 'src/app/core/services/layer-reference.service';
import { UserReference } from 'src/app/core/models/layer-references.model';
import { EquipmentDataService } from 'src/app/core/services/dataservices/equipment.dataservice';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.drawer.html',
  styleUrls: ['./equipment.drawer.scss'],
})
export class EquipmentDrawer implements OnInit, OnDestroy {
  constructor(
    private router: ActivatedRoute,
    private layerReferencesService: LayerReferencesService,
    private equipmentService: EquipmentDataService,
    private utils: UtilsService,
    private drawer: DrawerService
  ) {
    this.router.queryParams
      .pipe(
        takeUntil(this.ngUnsubscribe$),
        switchMap((params) => {
          this.eqTemp = params;
          return from(
            this.layerReferencesService.getUserReferences(params['layer'])
          );
        }),
        switchMap((refs: UserReference[]) => {
          this.userReferences = refs;
          return this.equipmentService.getById(this.eqTemp.id);
        }),
        catchError(() => {
          return of(this.eqTemp);
        })
      )
      .subscribe((equipment) => {
        this.equipment = equipment;

        // Remove empty references from the list
        this.userReferences = this.userReferences.filter(
          (element: UserReference) =>
            this.equipment[element.referenceKey] || !element.isVisible
        );
      });
  }

  public buttons: SynthesisButton[] = [
    { key: 'create', label: 'Générer une intervention', icon: 'person-circle' },
    { key: 'write', label: 'Saisir un compte-rendu', icon: 'pencil' },
    { key: 'ask', label: 'Faire une demande', icon: 'alert-circle' },
    { key: 'add', label: 'Ajouter à un programme', icon: 'add' },
    {
      key: 'update',
      label: 'Faire une demande de mise à jour',
      icon: 'reload',
    },
  ];

  public userReferences: UserReference[] = [];
  public equipment: any;
  public isMobile: boolean;

  private eqTemp: any;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.isMobile = this.utils.isMobilePlateform();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  ionViewWillLeave(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public navigateToDetails(): void {
    // if (this.isMobile) {
    //   this.drawer.closeModal();
    // }
    this.drawer.navigateTo(
      DrawerRouteEnum.EQUIPMENT_DETAILS,
      [this.equipment.id],
      this.equipment
    );
  }
}
