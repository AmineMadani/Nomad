import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { ActionsLayerDesktopComponent } from './components/actions-layer/actions-layer-desktop/actions-layer-desktop.component';
import { ActionsLayerMobileComponent } from './components/actions-layer/actions-layer-mobile/actions-layer-mobile.component';
import { MapComponent } from './components/map/map.component';

import { MatTreeModule } from '@angular/material/tree';
import { HttpClientModule } from '@angular/common/http';
import { AssetDrawer } from './drawers/asset/asset.drawer';
import { PerimeterDrawer } from './drawers/perimeter/perimeter.drawer';
import { HomePage } from './home.page';
import { ActionsLayerComponent } from './components/actions-layer/actions-layer.component';
import { FilterContentComponent } from './drawers/components/filter-content/filter-content.component';
import { FilterAccordeonComponent } from './drawers/components/filter-accordeon/filter-accordeon.component';
import { FilterTreeComponent } from './drawers/components/filter-tree/filter-tree.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExploitationDrawer } from './drawers/exploitation/exploitation.drawer';
import { FilterToggleComponent } from './drawers/components/filter-toggle/filter-toggle.component';
import { FilterCardComponent } from './drawers/components/filter-card/filter-card.component';
import { FilterSearchComponent } from './drawers/components/filter-search/filter-search.component';
import { FilterFavoriteComponent } from './drawers/components/filter-favorite/filter-favorite.component';
import { WorkOrderDrawer } from './drawers/synthesis/work-order/work-order.drawer';
import { FilterWorkOrderComponent } from './drawers/components/filter-card/filter-work-order/filter-work-order.component';
import { IonCustomScrollbarModule } from 'ion-custom-scrollbar';
import { SynthesisDrawer } from './drawers/synthesis/synthesis.drawer';
import { DemandeDrawer } from './drawers/synthesis/demande/demande.drawer';
import { EquipmentDrawer } from './drawers/synthesis/equipment/equipment.drawer';
import { EquipmentDetailsComponent } from './drawers/synthesis/equipment-details/equipment-details.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    SharedModule,
    HttpClientModule,
    MatTreeModule,
    IonCustomScrollbarModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    HomePage,
    ActionsLayerComponent,
    ActionsLayerDesktopComponent,
    ActionsLayerMobileComponent,
    MapComponent,
    AssetDrawer,
    ExploitationDrawer,
    PerimeterDrawer,
    FilterContentComponent,
    FilterAccordeonComponent,
    FilterTreeComponent,
    FilterToggleComponent,
    FilterCardComponent,
    FilterSearchComponent,
    FilterFavoriteComponent,
    FilterWorkOrderComponent,
    SynthesisDrawer,
    WorkOrderDrawer,
    DemandeDrawer,
    EquipmentDrawer,
    EquipmentDetailsComponent,
  ]
})
export class HomePageModule {}
