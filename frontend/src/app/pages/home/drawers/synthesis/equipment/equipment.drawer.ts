import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { catchError } from 'rxjs/internal/operators/catchError';
import { of } from 'rxjs/internal/observable/of';
import { from } from 'rxjs/internal/observable/from';
import { ActivatedRoute } from '@angular/router';
import { SynthesisButton } from '../synthesis.drawer';
import { LayerReferencesService } from 'src/app/core/services/layer-reference.service';
import { UserReference } from 'src/app/core/models/layer-references.model';
import { EquipmentDataService } from 'src/app/core/services/dataservices/equipment.dataservice';
import { UtilsService } from 'src/app/core/services/utils.service';
import { transform, transformExtent } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import * as uuid from 'uuid';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { MapService } from 'src/app/core/services/map/map.service';

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
    private mapService: MapService
  ) {
    this.router.queryParams.pipe(
      takeUntil(this.ngUnsubscribe),
      switchMap((params) => {
        this.eqTemp = params;
        return from(this.layerReferencesService.getUserReferences(params['layer']))
      }),
      switchMap((refs: UserReference[]) => {
        this.userReferences = refs;
        return this.equipmentService.getById(this.eqTemp.id);
      }),
      catchError(() => {
        return of(this.eqTemp);
      }),
    ).subscribe((equipment) => {
      this.equipment = equipment;

      // Remove empty references from the list
      this.userReferences =
        this.userReferences.filter((element: UserReference) => this.equipment[element.referenceKey] || !element.isVisible);
    })
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

  private ngUnsubscribe: Subject<void> = new Subject();

  ngOnInit(): void {
    this.isMobile = this.utils.isMobilePlateform();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ionViewWillLeave(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public onTabButtonClicked(ev: SynthesisButton): void {
    if(ev.key === 'create') {
      console.log(this.equipment);
      let coordinates: number[] = transformExtent(this.equipment.extent.split(','), 'EPSG:3857','EPSG:4326');
      let x = (coordinates[0]+coordinates[2])/2;
      let y = (coordinates[1]+coordinates[3])/2;
      console.log('val x : '+x);
      console.log('val y : '+y);
      console.log(this.equipment.extent);
      let point = new Point(transform([x,y],'EPSG:4326','EPSG:3857'));
      let uuidval = uuid.v4();
      let feature:Feature = new Feature({
        geometry: point,
        properties: {
          id: 999999,
          code_contrat: this.equipment.code_contrat,
          contrat: this.equipment.contrat,
          insee_code: this.equipment.insee_code,
          x: x,
          y: y,
          status: 'NP',
          layer: this.equipment.layer,
          external_id: this.equipment.id
        }
      });
      feature.setId(999999);
      console.log(feature);
      this.mapService.addEventLayer('intervention').then(() => {
        console.log('addfeature');
        this.mapService.getLayer('intervention').source.addFeature(feature);
      })
    }
  }
}
