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
import { InterventionDrawer } from './drawers/intervention/intervention.drawer';
import { PatrimonyDrawer } from './drawers/patrimony/patrimony.drawer';
import { PerimeterDrawer } from './drawers/perimeter/perimeter.drawer';
import { HomePage } from './home.page';
import { ActionsLayerComponent } from './components/actions-layer/actions-layer.component';
import { FilterContentComponent } from './drawers/components/filter-content/filter-content.component';
import { FilterAccordeonComponent } from './drawers/components/filter-accordeon/filter-accordeon.component';
import { FilterFavoriteComponent } from './drawers/components/filter-favorite/filter-favorite.component';
import { FilterTreeComponent } from './drawers/components/filter-tree/filter-tree.component';
import { EquipmentDrawer } from './drawers/equipment/equipment.drawer';
import { SharedModule } from 'src/app/shared/shared.module';
import { MapService } from 'src/app/core/services/map.service';

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
    InterventionDrawer,
    PerimeterDrawer,
    FilterContentComponent,
    FilterAccordeonComponent,
    FilterFavoriteComponent,
    FilterTreeComponent,
    EquipmentDrawer,
  ],
  providers: [MapService],
})
export class HomePageModule {}
