import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DrawerRouteEnum } from './drawers/drawer.enum';
import { EquipmentDrawer } from './drawers/equipment/equipment.drawer';
import { InterventionDrawer } from './drawers/intervention/intervention.drawer';
import { PatrimonyDrawer } from './drawers/patrimony/patrimony.drawer';
import { PerimeterDrawer } from './drawers/perimeter/perimeter.drawer';

import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    data: {
      name: DrawerRouteEnum.HOME,
    },
    children: [
      {
        path: 'patrimony',
        component: PatrimonyDrawer,
        data: {
          name: DrawerRouteEnum.PATRIMONY,
        },
      },
      {
        path: 'intervention',
        component: InterventionDrawer,
        data: {
          name: DrawerRouteEnum.INTERVENTION,
        },
      },
      {
        path: 'perimeter',
        component: PerimeterDrawer,
        data: {
          name: DrawerRouteEnum.PERIMETER,
        },
      },
      {
        path: 'equipment/:id',
        component: EquipmentDrawer,
        data: {
          name: DrawerRouteEnum.EQUIPMENT,
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
