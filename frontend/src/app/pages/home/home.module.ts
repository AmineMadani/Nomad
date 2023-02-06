import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { HomePage } from './home.page';
import { SharedModule } from 'src/app/modules/shared.module';
import { ActionsLayerComponent } from './components/actions-layer/actions-layer.component';
import { ActionsLayerDesktopComponent } from './components/actions-layer/actions-layer-desktop/actions-layer-desktop.component';
import { ActionsLayerMobileComponent } from './components/actions-layer/actions-layer-mobile/actions-layer-mobile.component';
import { MapComponent } from './components/map/map.component';
import { PatrimonyComponent } from './components/interactive-content/patrimony/patrimony.component';
import { PerimeterComponent } from './components/interactive-content/perimeter/perimeter.component';
import { InterventionComponent } from './components/interactive-content/intervention/intervention.component';
import { PatrimonyAccordeonComponent } from './components/interactive-content/patrimony/patrimony-accordeon/patrimony-accordeon.component';

import { MatTreeModule } from '@angular/material/tree';
import { PatrimonyDetailsTreeComponent } from './components/interactive-content/patrimony/patrimony-details-tree/patrimony-details-tree.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    SharedModule,
    MatTreeModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    HomePage,
    ActionsLayerComponent,
    ActionsLayerDesktopComponent,
    ActionsLayerMobileComponent,
    MapComponent,
    PatrimonyComponent,
    PerimeterComponent,
    InterventionComponent,
    PatrimonyAccordeonComponent,
    PatrimonyDetailsTreeComponent
  ],
})
export class HomePageModule {}
