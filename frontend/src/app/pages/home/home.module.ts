import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HomePageRoutingModule } from './home-routing.module';

import { ActionsLayerDesktopComponent } from './components/actions-layer/actions-layer-desktop/actions-layer-desktop.component';
import { ActionsLayerMobileComponent } from './components/actions-layer/actions-layer-mobile/actions-layer-mobile.component';

import { MatTreeModule } from '@angular/material/tree';
import { MatTooltipModule } from '@angular/material/tooltip';

import { HttpClientModule } from '@angular/common/http';
import { AssetFilterDrawer } from './drawers/asset-filter/asset-filter.drawer';
import { HomePage } from './home.page';
import { ActionsLayerComponent } from './components/actions-layer/actions-layer.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExploitationDrawer } from './drawers/exploitation/exploitation.drawer';
import { ExpCardComponent } from './drawers/exploitation/components/exp-card/exp-card.component';
import { TaskSearchComponent } from './drawers/exploitation/components/task-search/task-search.component';
import { TaskCardComponent } from './drawers/exploitation/components/exp-card/task-card/task-card.component';
import { IonCustomScrollbarModule } from 'ion-custom-scrollbar';
import { SynthesisDrawer } from './drawers/synthesis/synthesis.drawer';
import { DemandeDrawer } from './drawers/synthesis/demande/demande.drawer';
import { AssetDrawer } from './drawers/synthesis/asset/asset.drawer';
import { AssetDetailsComponent } from './drawers/synthesis/asset-details/asset-details.component';
import { MobileHomeActionsComponent } from './components/mobile-home-actions/mobile-home-actions.component';
import { MultipleSelectionDrawer } from './drawers/synthesis/multiple-selection/multiple-selection.drawer';
import { AssetFilterAccordionComponent } from './drawers/asset-filter/components/asset-filter-accordion/asset-filter-accordion.component';
import { AssetFilterDetailComponent } from './drawers/asset-filter/components/asset-filter-detail/asset-filter-detail.component';
import { AssetFilterFavoriteComponent } from './drawers/asset-filter/components/asset-filter-favorite/asset-filter-favorite.component';
import { WorkOrderDrawer } from './drawers/workorder/work-order.drawer';
import { WkoCreationComponent } from './drawers/workorder/pages/wko-creation/wko-creation.component';
import { WkoViewComponent } from './drawers/workorder/pages/wko-view/wko-view.component';
import { ReportDrawer } from './drawers/workorder/pages/report/report.drawer';
import { ReportCreateComponent } from './drawers/workorder/pages/report/components/report-create/report-create.component';
import { ReportContextComponent } from './drawers/workorder/pages/report/components/report-create/report-context/report-context.component';
import { ReportAssetComponent } from './drawers/workorder/pages/report/components/report-create/report-asset/report-asset.component';
import { ReportFormComponent } from './drawers/workorder/pages/report/components/report-create/report-form/report-form.component';
import { ReportDateComponent } from './drawers/workorder/pages/report/components/report-create/report-date/report-date.component';
import { WorkorderListComponent } from './drawers/exploitation/segments/workorder-list/workorder-list.component';
import { NewAssetDrawer } from './drawers/synthesis/multiple-selection/new-asset/new-asset.drawer';
import { WkoWaterTypeComponent } from './drawers/workorder/pages/wko-water-type/wko-water-type.component';
import { ItvListComponent } from './drawers/exploitation/segments/itv-list/itv-list.component';
import { ItvCardComponent } from './drawers/exploitation/components/exp-card/itv-card/itv-card.component';
import { ItvSearchComponent } from './drawers/exploitation/components/itv-search/itv-search.component';
import { MultiAssetsModalComponent } from './drawers/workorder/pages/multi-assets-modal/multi-assets-modal.component';
import { ItvImportComponent } from './drawers/exploitation/segments/itv-list/itv-import/itv-import.component';
import { GeographicalSelectionDrawer } from './drawers/geographical-selection/geographical-selection.drawer';


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
    MatTooltipModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    HomePage,
    ActionsLayerComponent,
    ActionsLayerDesktopComponent,
    ActionsLayerMobileComponent,
    AssetFilterDrawer,
    ExploitationDrawer,
    ExpCardComponent,
    TaskSearchComponent,
    TaskCardComponent,
    SynthesisDrawer,
    WorkOrderDrawer,
    DemandeDrawer,
    AssetDrawer,
    ReportDrawer,
    WorkorderListComponent,
    MultipleSelectionDrawer,
    AssetDetailsComponent,
    MobileHomeActionsComponent,
    AssetFilterAccordionComponent,
    AssetFilterDetailComponent,
    AssetFilterFavoriteComponent,
    WkoCreationComponent,
    WkoViewComponent,
    ReportCreateComponent,
    ReportAssetComponent,
    ReportDateComponent,
    ReportContextComponent,
    ReportFormComponent,
    NewAssetDrawer,
    WkoWaterTypeComponent,
    ItvListComponent,
    ItvCardComponent,
    ItvSearchComponent,
    MultiAssetsModalComponent,
    ItvImportComponent,
    GeographicalSelectionDrawer
  ],
  exports: [ReportCreateComponent]
})
export class HomePageModule {}
