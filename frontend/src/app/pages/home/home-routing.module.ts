import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DrawerRouteEnum } from 'src/app/core/models/drawer.model';
import { ExploitationDrawer } from './drawers/exploitation/exploitation.drawer';
import { AssetFilterDrawer } from './drawers/asset-filter/asset-filter.drawer';

import { HomePage } from './home.page';
import { DemandeDrawer } from './drawers/synthesis/demande/demande.drawer';
import { AssetDrawer } from './drawers/synthesis/asset/asset.drawer';
import { AssetDetailsComponent } from './drawers/synthesis/asset-details/asset-details.component';
import { MultipleSelectionDrawer } from './drawers/synthesis/multiple-selection/multiple-selection.drawer';
import { WkoCreationComponent } from './drawers/workorder/pages/wko-creation/wko-creation.component';
import { WkoViewComponent } from './drawers/workorder/pages/wko-view/wko-view.component';
import { WorkOrderDrawer } from './drawers/workorder/work-order.drawer';
import { ReportDrawer } from './drawers/workorder/pages/report/report.drawer';
import { PermissionCodeEnum } from 'src/app/core/models/user.model';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { NewAssetDrawer } from './drawers/synthesis/multiple-selection/new-asset/new-asset.drawer';
import { WkoWaterTypeComponent } from './drawers/workorder/pages/wko-water-type/wko-water-type.component';
import { GeographicalSelectionDrawer } from './drawers/geographical-selection/geographical-selection.drawer';
import { ItvViewComponent } from './drawers/exploitation/segments/itv-list/itv-view/itv-view.component';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    data: {
      name: DrawerRouteEnum.HOME,
    },
    children: [
      {
        path: 'asset-filter',
        component: AssetFilterDrawer,
        data: {
          name: DrawerRouteEnum.ASSET_FILTER,
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
        path: 'asset/:id',
        component: AssetDrawer,
        data: {
          name: DrawerRouteEnum.ASSET,
        },
      },
      {
        path: 'asset/:id/details',
        component: AssetDetailsComponent,
        canActivate: [AuthGuard],
        data: {
          name: DrawerRouteEnum.ASSET_DETAILS,
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
            path: ':id/task/:taskid/cr',
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
      {
        path: 'geographical-selection',
        component: GeographicalSelectionDrawer,
        data: {
          name: DrawerRouteEnum.GEOGRAPHICAL_SELECTION,
        },
      },
      {
        path: 'itv/:id',
        component: ItvViewComponent,
        data: {
          name: DrawerRouteEnum.ITV_VIEW,
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
