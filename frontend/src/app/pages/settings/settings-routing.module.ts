import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsPage } from './settings.page';
import { UsersSettingsPage } from './users-settings/users-settings.component';
import { AssetSettingsPage } from './asset-settings/asset-settings.component';
import { LayerReferencesSettingsPage } from './layer-references-settings/layer-references-settings.component';
import { LayerStylesSettingsPage } from './layer-styles-settings/layer-styles-settings.component';
import { ReportSettingsPage } from './report-settings/report-settings.component';
import { PermissionsSettingsPage } from './permissions-settings/permissions-settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage,
    children: [
      {
        path: '',
        redirectTo: 'asset',
        pathMatch: 'full'
      },
      {
        path: 'asset',
        component: AssetSettingsPage,
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
        component: UsersSettingsPage,
      },
      {
        path: 'permissions',
        component: PermissionsSettingsPage,
      },
      {
        path: 'reports',
        component: ReportSettingsPage,
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
