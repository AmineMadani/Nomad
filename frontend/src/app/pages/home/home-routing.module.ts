import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { ExploitationDrawer } from './drawers/exploitation/exploitation.drawer';
import { AssetDrawer } from './drawers/asset/asset.drawer';

import { HomePage } from './home.page';
import { WorkOrderDrawer } from './drawers/synthesis/work-order/work-order.drawer';
import { DemandeDrawer } from './drawers/synthesis/demande/demande.drawer';
import { EquipmentDrawer } from './drawers/synthesis/equipment/equipment.drawer';
import { EquipmentDetailsComponent } from './drawers/synthesis/equipment-details/equipment-details.component';
import { MultipleSelectionDrawer } from './drawers/synthesis/multiple-selection/multiple-selection.drawer';
import { ReportDrawer } from './drawers/report/report.drawer';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    data: {
      name: DrawerRouteEnum.HOME,
    },
    children: [
      {
        path: 'asset',
        component: AssetDrawer,
        data: {
          name: DrawerRouteEnum.ASSET,
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
        path: 'equipment/:id',
        component: EquipmentDrawer,
        data: {
          name: DrawerRouteEnum.EQUIPMENT,
        },
      },
      {
        path: 'equipment/:id/details',
        component: EquipmentDetailsComponent,
        data: {
          name: DrawerRouteEnum.EQUIPMENT_DETAILS,
        },
      },
      {
        path: 'work-order/:id',
        component: WorkOrderDrawer,
        data: {
          name: DrawerRouteEnum.WORKORDER,
        },
      },
      {
        path: 'work-order/:id/cr',
        component: ReportDrawer,
        data: {
          name: DrawerRouteEnum.REPORT,
        },
      },
      {
        path: 'work-order',
        component: WorkOrderDrawer,
        data: {
          name: DrawerRouteEnum.WORKORDER,
        },
      },
      {
        path: 'selection',
        component: MultipleSelectionDrawer,
        data: {
          name: DrawerRouteEnum.SELECTION,
        },
      },
      {
        path: 'demande/:id',
        component: DemandeDrawer,
        data: {
          name: DrawerRouteEnum.DEMANDE,
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
