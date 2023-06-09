import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatrimonySettingsComponent } from './patrimony-settings/patrimony-settings.component';
import { SettingsSegmentComponent } from './components/settings-segment/settings-segment.component';
import { LayerReferencesSettingsComponent } from './layer-references-settings/layer-references-settings.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    SettingsPageRoutingModule
  ],
  declarations: [
    SettingsPage,
    PatrimonySettingsComponent,
    LayerReferencesSettingsComponent,
    SettingsSegmentComponent
  ]
})
export class SettingsPageModule {}
