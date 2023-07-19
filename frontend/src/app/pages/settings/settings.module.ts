import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatrimonySettingsPage } from './patrimony-settings/patrimony-settings.component';
import { SettingsSegmentComponent } from './components/settings-segment/settings-segment.component';
import { LayerReferencesSettingsPage } from './layer-references-settings/layer-references-settings.component';
import { LayerStylesSettingsPage } from './layer-styles-settings/layer-styles-settings.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    SettingsPageRoutingModule,
  ],
  declarations: [
    SettingsPage,
    PatrimonySettingsPage,
    LayerReferencesSettingsPage,
    LayerStylesSettingsPage,
    SettingsSegmentComponent
  ]
})
export class SettingsPageModule {}
