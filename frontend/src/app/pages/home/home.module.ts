import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { SharedModule } from 'src/app/modules/shared.module';
import { ActionsLayerDesktopComponent } from './components/actions-layer/actions-layer-desktop/actions-layer-desktop.component';
import { ActionsLayerMobileComponent } from './components/actions-layer/actions-layer-mobile/actions-layer-mobile.component';
import { MapComponent } from './components/map/map.component';

import { MatTreeModule } from '@angular/material/tree';
import { HttpClientModule } from '@angular/common/http';
import { MapService } from 'src/app/services/map.service';
import { InterventionDrawer } from './drawers/intervention/intervention.drawer';
import { PatrimonyAccordeonComponent } from './drawers/patrimony/components/patrimony-accordeon/patrimony-accordeon.component';
import { PatrimonyDetailsTreeComponent } from './drawers/patrimony/components/patrimony-details-tree/patrimony-details-tree.component';
import { PatrimonyDrawer } from './drawers/patrimony/patrimony.drawer';
import { PerimeterDrawer } from './drawers/perimeter/perimeter.drawer';
import { HomePage } from './home.page';
import { ActionsLayerComponent } from './components/actions-layer/actions-layer.component';

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
    PatrimonyAccordeonComponent,
    PatrimonyDetailsTreeComponent,
  ],
  providers: [MapService],
})
export class HomePageModule {}
