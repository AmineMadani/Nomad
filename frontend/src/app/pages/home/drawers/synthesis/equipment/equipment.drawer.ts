import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { ActivatedRoute, Router } from '@angular/router';
import { SynthesisButton } from '../synthesis.drawer';
import { LayerReferencesService } from 'src/app/core/services/layer-reference.service';
import { UserReference } from 'src/app/core/models/layer-references.model';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { LayerService } from 'src/app/core/services/map/layer.service';
import { LayerDataService } from 'src/app/core/services/dataservices/layer.dataservice';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.drawer.html',
  styleUrls: ['./equipment.drawer.scss'],
})
export class EquipmentDrawer implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private layerReferencesService: LayerReferencesService,
    private utils: UtilsService,
    private drawer: DrawerService,
    private activatedRoute: ActivatedRoute,
    private layerService: LayerService,
    private layerDataService: LayerDataService
  ) { }

  public buttons: SynthesisButton[] = [
    { key: 'create', label: 'Générer une intervention', icon: 'person-circle' },
    { key: 'write', label: 'Saisir un compte-rendu', icon: 'pencil' },
    { key: 'ask', label: 'Faire une demande', icon: 'alert-circle' },
    { key: 'add', label: 'Ajouter à un programme', icon: 'add' },
    { key: 'update', label: 'Faire une demande de mise à jour', icon: 'reload' },
  ];

  public userReferences: UserReference[] = [];
  public equipment: any;
  public isMobile: boolean;
  public isDetailAvailabled: boolean = false;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.isMobile = this.utils.isMobilePlateform();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public onTabButtonClicked(ev: SynthesisButton): void {
    if (ev.key === 'create') {
      this.router.navigate(
        ['/home/work-order'],
        { queryParams: this.equipment }
      );
    }
  }

  public onNavigateToDetails(): void {
    this.drawer.navigateTo(
      DrawerRouteEnum.EQUIPMENT_DETAILS,
      [this.equipment.id],
      this.equipment
    );
  }

  public onInitEquipment() {
    const urlParams = new URLSearchParams(window.location.search);
    let paramMap = new Map(urlParams.entries());
    this.layerReferencesService.getUserReferences(paramMap.get('lyr_table_name')).then(ref => {
      this.userReferences = ref;
      this.equipment = paramMap;
      this.activatedRoute.params.subscribe(localParam => {
        if (localParam['id'] && paramMap.get('lyr_table_name')) {
          this.equipment = this.layerService.getFeatureById(paramMap.get('lyr_table_name'), localParam['id']).properties;
          this.equipment.lyr_table_name = paramMap.get('lyr_table_name');
          this.layerDataService.getEquipmentByLayerAndId(this.equipment.lyr_table_name, this.equipment.id).subscribe( res => {
            this.equipment=res[0];
            this.equipment.lyr_table_name = paramMap.get('lyr_table_name');
            this.isDetailAvailabled = true;
          });
        }
      });
    })
  }
}
