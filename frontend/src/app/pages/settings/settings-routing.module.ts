import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsPage } from './settings.page';
import { UsersSettingsComponent } from './users-settings/users-settings.component';
import { PatrimonySettingsPage } from './patrimony-settings/patrimony-settings.component';
import { LayerReferencesSettingsPage } from './layer-references-settings/layer-references-settings.component';
import { LayerStylesSettingsPage } from './layer-styles-settings/layer-styles-settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage,
    children: [
      {
        path: '',
        redirectTo: 'layer-references',
        pathMatch: 'full'
      },
      {
        path: 'patrimony',
        component: PatrimonySettingsPage,
      },
      {
        path: 'layer-references',
        component: LayerReferencesSettingsPage,
      },
      {
        path: 'layer-styles',
        component: LayerStylesSettingsPage,
      },
      {
        path: 'users',
        component: UsersSettingsComponent,
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
