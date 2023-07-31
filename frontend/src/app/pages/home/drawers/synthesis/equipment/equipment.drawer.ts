import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { from } from 'rxjs/internal/observable/from';
import { Router } from '@angular/router';
import { SynthesisButton } from '../synthesis.drawer';
import { LayerReferencesService } from 'src/app/core/services/layer-reference.service';
import { ReferenceDisplayType, UserReference } from 'src/app/core/models/layer-references.model';
import { UtilsService } from 'src/app/core/services/utils.service';
import { DrawerService } from 'src/app/core/services/drawer.service';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { CacheService } from 'src/app/core/services/cache.service';

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
    private cacheService: CacheService
  ) {}

  public buttons: SynthesisButton[] = [
    { key: 'create', label: 'Générer une intervention', icon: 'person-circle' },
  ];

  public userReferences: UserReference[] = [];
  public equipment: any;
  public isMobile: boolean;
  public isDetailAvailabled: boolean = false;
  public assetLabel: string;
  public ReferenceDisplayType = ReferenceDisplayType;

  private ngUnsubscribe$: Subject<void> = new Subject();

  ngOnInit(): void {
    this.isMobile = this.utils.isMobilePlateform();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  public async onTabButtonClicked(ev: SynthesisButton) {
    if (ev.key === 'create') {
      // Mono-equipment
      const { id, ...eq } = this.equipment;
      this.router.navigate(['/home/work-order'], {
        queryParams: { [this.equipment.lyr_table_name]: this.equipment.id },
      });
    }
  }

  public onNavigateToDetails(): void {
    this.drawer.navigateTo(
      DrawerRouteEnum.EQUIPMENT_DETAILS,
      [this.equipment.id],
      this.equipment
    );
  }

  public onInitEquipment(feature: any) {
    from(
      this.layerReferencesService.getUserReferences(feature.lyr_table_name)
    ).subscribe(async (refs: UserReference[]) => {
      const currentLayer = (
        await this.cacheService.getObjectFromCache('referentials', 'layers')
      ).data.find((l) => l.lyrTableName === `asset.${feature.lyr_table_name}`);
      this.assetLabel = `${currentLayer.domLLabel} - ${currentLayer.lyrSlabel}`;
      this.userReferences = refs;
      console.log(this.userReferences);
      this.equipment = feature;
      this.isDetailAvailabled = true;
    });
  }
}
