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
import { PatrimonyDrawer } from './drawers/patrimony/patrimony.drawer';
import { PerimeterDrawer } from './drawers/perimeter/perimeter.drawer';
import { HomePage } from './home.page';
import { ActionsLayerComponent } from './components/actions-layer/actions-layer.component';
import { FilterContentComponent } from './drawers/components/filter-content/filter-content.component';
import { FilterAccordeonComponent } from './drawers/components/filter-accordeon/filter-accordeon.component';
import { FilterTreeComponent } from './drawers/components/filter-tree/filter-tree.component';
import { EquipmentDrawer } from './drawers/equipment/equipment.drawer';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExploitationDrawer } from './drawers/exploitation/exploitation.drawer';
import { FilterToggleComponent } from './drawers/components/filter-toggle/filter-toggle.component';
import { FilterCardComponent } from './drawers/components/filter-card/filter-card.component';
import { FilterSearchComponent } from './drawers/components/filter-search/filter-search.component';
import { FilterFavoriteComponent } from './drawers/components/filter-favorite/filter-favorite.component';
import { InterventionDrawer } from './drawers/intervention/intervention.drawer';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FilterWorkOrderComponent } from './drawers/components/filter-card/filter-work-order/filter-work-order.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    SharedModule,
    HttpClientModule,
    MatTreeModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    HomePage,
    ActionsLayerComponent,
    ActionsLayerDesktopComponent,
    ActionsLayerMobileComponent,
    MapComponent,
    PatrimonyDrawer,
    ExploitationDrawer,
    PerimeterDrawer,
    FilterContentComponent,
    FilterAccordeonComponent,
    FilterTreeComponent,
    FilterToggleComponent,
    FilterCardComponent,
    FilterSearchComponent,
    FilterFavoriteComponent,
    EquipmentDrawer,
    InterventionDrawer,
    FilterWorkOrderComponent,
  ],
})
export class HomePageModule {}
