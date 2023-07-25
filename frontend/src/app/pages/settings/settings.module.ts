import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SettingsPageRoutingModule } from './settings-routing.module';

import { SettingsPage } from './settings.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { PatrimonySettingsComponent } from './patrimony-settings/patrimony-settings.component';
import { SettingsSegmentComponent } from './components/settings-segment/settings-segment.component';
import { LayerReferencesSettingsComponent } from './layer-references-settings/layer-references-settings.component';
import { UserCreationComponent } from './user-creation/user-creation.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SharedModule,
    SettingsPageRoutingModule
  ],
  declarations: [
    SettingsPage,
    SettingsSegmentComponent,
    PatrimonySettingsComponent,
    LayerReferencesSettingsComponent,
    UserCreationComponent,
  ]
})
export class SettingsPageModule {}
