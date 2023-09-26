import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { ExploitationDrawer } from './drawers/exploitation/exploitation.drawer';
import { AssetDrawer } from './drawers/asset/asset.drawer';

import { HomePage } from './home.page';
import { DemandeDrawer } from './drawers/synthesis/demande/demande.drawer';
import { EquipmentDrawer } from './drawers/synthesis/equipment/equipment.drawer';
import { EquipmentDetailsComponent } from './drawers/synthesis/equipment-details/equipment-details.component';
import { MultipleSelectionDrawer } from './drawers/synthesis/multiple-selection/multiple-selection.drawer';
import { WkoCreationComponent } from './drawers/workorder/pages/wko-creation/wko-creation.component';
import { WkoViewComponent } from './drawers/workorder/pages/wko-view/wko-view.component';
import { WorkOrderDrawer } from './drawers/workorder/work-order.drawer';
import { ReportDrawer } from './drawers/workorder/pages/report/report.drawer';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { NewAssetDrawer } from './drawers/synthesis/multiple-selection/new-asset/new-asset.drawer';
import { WkoWaterTypeComponent } from './drawers/workorder/pages/wko-water-type/wko-water-type.component';

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
        path: 'asset/new',
        component: NewAssetDrawer,
        data: {
          name: DrawerRouteEnum.NEW_ASSET,
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
        canActivate: [AuthGuard],
        data: {
          name: DrawerRouteEnum.EQUIPMENT_DETAILS,
          authorizedPermissions: [PermissionCodeEnum.VIEW_ASSET_DETAILLED],
        },
      },
      {
        path: 'water-type',
        component: WkoWaterTypeComponent,
        canActivate: [AuthGuard],
        data: {
          name: DrawerRouteEnum.WORKORDER_WATER_TYPE,
          authorizedPermissions: [
            PermissionCodeEnum.CREATE_NO_PLAN_WORKORDER,
            PermissionCodeEnum.CREATE_X_Y_WORKORDER,
            PermissionCodeEnum.CREATE_ASSET_WORKORDER,
            PermissionCodeEnum.SEND_WORKORDER
          ]
        },
      },
      {
        path: 'workorder',
        component: WorkOrderDrawer,
        data: {
          name: DrawerRouteEnum.WORKORDER,
        },
        children: [
          {
            path: '',
            component: WkoCreationComponent,
            canActivate: [AuthGuard],
            data: {
              name: DrawerRouteEnum.WORKORDER_CREATION,
              authorizedPermissions: [
                PermissionCodeEnum.CREATE_NO_PLAN_WORKORDER,
                PermissionCodeEnum.CREATE_X_Y_WORKORDER,
                PermissionCodeEnum.CREATE_ASSET_WORKORDER,
                PermissionCodeEnum.SEND_WORKORDER,
              ],
            },
          },
          {
            path: ':id/edit',
            component: WkoCreationComponent,
            canActivate: [AuthGuard],
            data: {
              name: DrawerRouteEnum.WORKORDER_EDITION,
              authorizedPermissions: [
                PermissionCodeEnum.CREATE_NO_PLAN_WORKORDER,
                PermissionCodeEnum.CREATE_X_Y_WORKORDER,
                PermissionCodeEnum.CREATE_ASSET_WORKORDER,
                PermissionCodeEnum.SEND_WORKORDER,
              ],
            },
          },
          {
            path: ':id',
            component: WkoViewComponent,
            data: {
              name: DrawerRouteEnum.WORKORDER_VIEW,
            },
          },
          {
            path: ':id/cr',
            component: ReportDrawer,
            data: {
              name: DrawerRouteEnum.REPORT,
            },
          },
          {
            path: ':id/task/:taskid',
            component: WkoViewComponent,
            data: {
              name: DrawerRouteEnum.WORKORDER_VIEW,
            },
          },
        ],
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
