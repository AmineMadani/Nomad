import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { ActionsLayerDesktopComponent } from './components/actions-layer/actions-layer-desktop/actions-layer-desktop.component';
import { ActionsLayerMobileComponent } from './components/actions-layer/actions-layer-mobile/actions-layer-mobile.component';
import { MapComponent } from './components/map/map.component';

import { MatTreeModule } from '@angular/material/tree';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HttpClientModule } from '@angular/common/http';
import { AssetDrawer } from './drawers/asset/asset.drawer';
import { HomePage } from './home.page';
import { ActionsLayerComponent } from './components/actions-layer/actions-layer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExploitationDrawer } from './drawers/exploitation/exploitation.drawer';
import { ExpCardComponent } from './drawers/components/exp-card/exp-card.component';
import { ExpSearchComponent } from './drawers/exploitation/components/exp-search/exp-search.component';

import { TaskCardComponent } from './drawers/components/exp-card/task-card/task-card.component';
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
import { WorkOrderDrawer } from './drawers/workorder/work-order.drawer';
import { WkoCreationComponent } from './drawers/workorder/pages/wko-creation/wko-creation.component';
import { WkoViewComponent } from './drawers/workorder/pages/wko-view/wko-view.component';
import { ReportDrawer } from './drawers/workorder/pages/report/report.drawer';
import { ReportStepperComponent } from './drawers/workorder/pages/report/components/report-stepper/report-stepper.component';
import { ReportCreateComponent } from './drawers/workorder/pages/report/components/report-create/report-create.component';
import { ReportContextComponent } from './drawers/workorder/pages/report/components/report-context/report-context.component';
import { ReportAssetComponent } from './drawers/workorder/pages/report/components/report-asset/report-asset.component';
import { ReportFormComponent } from './drawers/workorder/pages/report/components/report-form/report-form.component';
import { WorkorderListComponent } from './drawers/exploitation/components/workorder-list/workorder-list.component';
import { AttachmentComponent } from './drawers/components/attachment/attachment.component';
import { NewAssetDrawer } from './drawers/synthesis/multiple-selection/new-asset/new-asset.drawer';
import { WkoWaterTypeComponent } from './drawers/workorder/pages/wko-water-type/wko-water-type.component';
import { MulticontractModalComponent } from './drawers/workorder/pages/multicontract-modal/multicontract-modal.component';

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
    IonCustomScrollbarModule,
    MatTooltipModule
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
    ExpCardComponent,
    ExpSearchComponent,
    TaskCardComponent,
    SynthesisDrawer,
    WorkOrderDrawer,
    DemandeDrawer,
    EquipmentDrawer,
    ReportDrawer,
    WorkorderListComponent,
    MultipleSelectionDrawer,
    EquipmentDetailsComponent,
    MobileHomeActionsComponent,
    AssetAccordionComponent,
    AssetDetailComponent,
    AssetFavoriteComponent,
    WkoCreationComponent,
    WkoViewComponent,
    ReportStepperComponent,
    ReportCreateComponent,
    ReportAssetComponent,
    ReportContextComponent,
    ReportFormComponent,
    AttachmentComponent,
    NewAssetDrawer,
    WkoWaterTypeComponent,
    MulticontractModalComponent,
  ],
  exports: [ReportCreateComponent]
})
export class HomePageModule {}
