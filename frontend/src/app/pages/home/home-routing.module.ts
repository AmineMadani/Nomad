import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InterventionDrawer } from './drawers/intervention/intervention.drawer';
import { PatrimonyDrawer } from './drawers/patrimony/patrimony.drawer';
import { PerimeterDrawer } from './drawers/perimeter/perimeter.drawer';

import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'patrimony',
        component: PatrimonyDrawer,
      },
      {
        path: 'intervention',
        component: InterventionDrawer,
      },
      {
        path: 'perimeter',
        component: PerimeterDrawer,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
