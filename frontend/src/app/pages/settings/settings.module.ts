import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatrimonySettingsPage } from './patrimony-settings/patrimony-settings.component';
import { SettingsSegmentComponent } from './components/settings-segment/settings-segment.component';
import { UsersSettingsComponent } from './users-settings/users-settings.component';
import { LayerReferencesSettingsPage } from './layer-references-settings/layer-references-settings.component';
import { LayerStylesSettingsPage } from './layer-styles-settings/layer-styles-settings.component';
import { LayerStyleComponent } from './layer-styles-settings/layer-style/layer-style.component';
import { UserDetailsComponent } from './users-settings/user-details/user-details.component';
import { ReportListComponent } from './report-list/report-list.component';
import { ReportEditComponent } from './report-list/report-edit/report-edit.component';
import { ValueLabelComponent } from './report-list/report-edit/value-label/value-label.component';
import { SelectDuplicateReportComponent } from './report-list/report-edit/select-duplicate-report/select-duplicate-report.component';
import { TestReportComponent } from './report-list/report-edit/test-report/test-report.component';
import { HomePageModule } from '../home/home.module';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    SettingsPageRoutingModule,
    HomePageModule,
  ],
  declarations: [
    SettingsPage,
    SettingsSegmentComponent,
    PatrimonySettingsPage,
    UsersSettingsComponent,
    PatrimonySettingsPage,
    LayerReferencesSettingsPage,
    LayerStylesSettingsPage,
    LayerStyleComponent,
    UserDetailsComponent,
    ReportListComponent,
    ReportEditComponent,
    ValueLabelComponent,
    SelectDuplicateReportComponent,
    TestReportComponent,
  ]
})
export class SettingsPageModule {}
