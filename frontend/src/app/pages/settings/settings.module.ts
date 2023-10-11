import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { AssetSettingsPage } from './asset-settings/asset-settings.component';
import { SettingsSegmentComponent } from './components/settings-segment/settings-segment.component';
import { UsersSettingsPage } from './users-settings/users-settings.component';
import { LayerReferencesSettingsPage } from './layer-references-settings/layer-references-settings.component';
import { LayerStylesSettingsPage } from './layer-styles-settings/layer-styles-settings.component';
import { LayerStyleComponent } from './layer-styles-settings/layer-style/layer-style.component';
import { UserDetailsComponent } from './users-settings/user-details/user-details.component';
import { ReportSettingsPage } from './report-settings/report-settings.component';
import { ReportEditComponent } from './report-settings/report-edit/report-edit.component';
import { ValueLabelComponent } from './report-questions-settings/report-question-edit/value-label/value-label.component';
import { SelectDuplicateReportComponent } from './report-settings/report-edit/select-duplicate-report/select-duplicate-report.component';
import { TestReportComponent } from './report-settings/report-edit/test-report/test-report.component';
import { HomePageModule } from '../home/home.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsHeaderComponent } from './components/settings-header/settings-header.component';
import { MatTreeModule } from '@angular/material/tree';
import { PermissionsSettingsPage } from './permissions-settings/permissions-settings.component';
import { ReportQuestionsSettingsComponent } from './report-questions-settings/report-questions-settings.component';
import { ReportQuestionEditComponent } from './report-questions-settings/report-question-edit/report-question-edit.component';
import { DeleteReportQuestionConfirmationComponent } from './report-questions-settings/delete-report-question-confirmation/delete-report-question-confirmation.component';

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
    MatTooltipModule,
    MatTreeModule,
  ],
  declarations: [
    SettingsPage,
    SettingsSegmentComponent,
    AssetSettingsPage,
    UsersSettingsPage,
    LayerReferencesSettingsPage,
    LayerStylesSettingsPage,
    LayerStyleComponent,
    UserDetailsComponent,
    ReportSettingsPage,
    ReportEditComponent,
    ValueLabelComponent,
    SelectDuplicateReportComponent,
    TestReportComponent,
    SettingsHeaderComponent,
    PermissionsSettingsPage,
    ReportQuestionsSettingsComponent,
    ReportQuestionEditComponent,
    DeleteReportQuestionConfirmationComponent,
  ]
})
export class SettingsPageModule {}
