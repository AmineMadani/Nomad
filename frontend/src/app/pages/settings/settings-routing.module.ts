import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsPage } from './settings.page';
import { PatrimonySettingsComponent } from './patrimony-settings/patrimony-settings.component';
import { LayerReferencesSettingsComponent } from './layer-references-settings/layer-references-settings.component';
import { UserCreationComponent } from './user-creation/user-creation.component';

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
        component: PatrimonySettingsComponent,
      },
      {
        path: 'layer-references',
        component: LayerReferencesSettingsComponent,
      },
      {
        path: 'events',
        component: PatrimonySettingsComponent,
      },
      {
        path: 'perimeter',
        component: PatrimonySettingsComponent,
      },
      {
        path: 'workorder',
        component: PatrimonySettingsComponent,
      },
      {
        path: 'report',
        component: PatrimonySettingsComponent,
      },
      {
        path: 'user',
        component: UserCreationComponent,
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
