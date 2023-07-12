import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { ActionsLayerDesktopComponent } from './components/actions-layer/actions-layer-desktop/actions-layer-desktop.component';
import { ActionsLayerMobileComponent } from './components/actions-layer/actions-layer-mobile/actions-layer-mobile.component';
import { MapComponent } from './components/map/map.component';

import { MatTreeModule } from '@angular/material/tree';
import { HttpClientModule } from '@angular/common/http';
import { AssetDrawer } from './drawers/asset/asset.drawer';
import { HomePage } from './home.page';
import { ActionsLayerComponent } from './components/actions-layer/actions-layer.component';
import { FilterContentComponent } from './drawers/components/filter-content/filter-content.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExploitationDrawer } from './drawers/exploitation/exploitation.drawer';
import { FilterToggleComponent } from './drawers/components/filter-toggle/filter-toggle.component';
import { FilterCardComponent } from './drawers/components/filter-card/filter-card.component';
import { FilterSearchComponent } from './drawers/components/filter-search/filter-search.component';
import { WorkOrderDrawer } from './drawers/synthesis/work-order/work-order.drawer';
import { FilterWorkOrderComponent } from './drawers/components/filter-card/filter-work-order/filter-work-order.component';
import { IonCustomScrollbarModule } from 'ion-custom-scrollbar';
import { SynthesisDrawer } from './drawers/synthesis/synthesis.drawer';
import { DemandeDrawer } from './drawers/synthesis/demande/demande.drawer';
import { EquipmentDrawer } from './drawers/synthesis/equipment/equipment.drawer';
import { EquipmentDetailsComponent } from './drawers/synthesis/equipment-details/equipment-details.component';
import { MobileHomeActionsComponent } from './components/mobile-home-actions/mobile-home-actions.component';
import { MultipleSelectionDrawer } from './drawers/synthesis/multiple-selection/multiple-selection.drawer';
import { AssetAccordionComponent } from './drawers/asset/components/asset-accordion/asset-accordion.component';
import { AssetDetailComponent } from './drawers/asset/components/asset-detail/asset-detail.component';
import { AssetFavoriteComponent } from './drawers/asset/components/asset-favorite/asset-favorite.component';
import { ReportDrawer } from './drawers/report/report.drawer';
import { WkoCreationComponent } from './drawers/components/wko-creation/wko-creation.component';
import { WkoViewComponent } from './drawers/components/wko-view/wko-view.component';
import { WkoReferentialComponent } from './drawers/components/wko-referential/wko-referential.component';
import { ReportStepperComponent } from './drawers/report/components/report-stepper/report-stepper.component';
import { ReportCreateComponent } from './drawers/report/components/report-create/report-create.component';
import { ReportAssetComponent } from './drawers/report/components/report-asset/report-asset.component';
import { ReportContextComponent } from './drawers/report/components/report-context/report-context.component';
import { ReportFormComponent } from './drawers/report/components/report-form/report-form.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    FilterContentComponent,
    FilterToggleComponent,
    FilterCardComponent,
    FilterSearchComponent,
    FilterWorkOrderComponent,
    SynthesisDrawer,
    WorkOrderDrawer,
    DemandeDrawer,
    EquipmentDrawer,
    ReportDrawer,
    MultipleSelectionDrawer,
    EquipmentDetailsComponent,
    MobileHomeActionsComponent,
    AssetAccordionComponent,
    AssetDetailComponent,
    AssetFavoriteComponent,
    WkoCreationComponent,
    WkoViewComponent,
    WkoReferentialComponent,
    ReportStepperComponent,
    ReportCreateComponent,
    ReportAssetComponent,
    ReportContextComponent,
    ReportFormComponent
  ]
})
export class HomePageModule {}
