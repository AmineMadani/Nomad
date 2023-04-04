import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { EquipmentDrawer } from './drawers/equipment/equipment.drawer';
import { ExploitationDrawer } from './drawers/exploitation/exploitation.drawer';
import { PatrimonyDrawer } from './drawers/patrimony/patrimony.drawer';
import { PerimeterDrawer } from './drawers/perimeter/perimeter.drawer';

import { HomePage } from './home.page';
import { InterventionDrawer } from './drawers/intervention/intervention.drawer';

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
        path: 'exploitation',
        component: ExploitationDrawer,
        data: {
          name: DrawerRouteEnum.EXPLOITATION,
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
      {
        path: 'intervention/:id',
        component: InterventionDrawer,
        data: {
          name: DrawerRouteEnum.INTERVENTION,
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
