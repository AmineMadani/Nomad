export enum DrawerRouteEnum {
  HOME = 'HOME',
  PERIMETER = 'PERIMETER',
  EXPLOITATION = 'EXPLOITATION',
  ASSET_FILTER = 'ASSET_FILTER',
  ASSET = 'ASSET',
  ASSET_DETAILS = 'ASSET_DETAILS',
  WORKORDER = 'WORKORDER',
  WORKORDER_WATER_TYPE = 'WORKORDER_WATER_TYPE',
  WORKORDER_CREATION = 'WORKORDER_CREATION',
  WORKORDER_EDITION = 'WORKORDER_EDITION',
  WORKORDER_VIEW = 'WORKORDER_VIEW',
  TASK_VIEW = 'TASK_VIEW',
  REPORT = 'REPORT',
  DEMANDE = 'DEMANDE',
  SELECTION = 'SELECTION',
  NEW_ASSET = 'NEW_ASSET',
  GEOGRAPHICAL_SELECTION = 'GEOGRAPHICAL_SELECTION',
  ITV_VIEW = 'ITV_VIEW',
}

export enum DrawerTypeEnum {
  BOTTOM_SHEET = 'BOTTOM_SHEET',
  DRAWER = 'DRAWER',
  DRAWER_FULL = 'DRAWER_FULL',
  NONE = 'NONE',
}

export const drawerRoutes = [
  {
    path: '/home',
    name: DrawerRouteEnum.HOME,
  },
  {
    path: '/home/perimeter',
    name: DrawerRouteEnum.PERIMETER,
  },
  {
    path: '/home/exploitation',
    name: DrawerRouteEnum.EXPLOITATION,
  },
  {
    path: '/home/asset-filter',
    name: DrawerRouteEnum.ASSET_FILTER,
  },
  {
    path: '/home/asset/:id',
    name: DrawerRouteEnum.ASSET,
  },
  {
    path: '/home/asset/:id/details',
    name: DrawerRouteEnum.ASSET_DETAILS,
  },
  {
    path: '/home/water-type',
    name: DrawerRouteEnum.WORKORDER_WATER_TYPE,
  },
  {
    path: '/home/workorder/',
    name: DrawerRouteEnum.WORKORDER,
  },
  {
    path: '/home/workorder/',
    name: DrawerRouteEnum.WORKORDER_CREATION,
  },
  {
    path: '/home/workorder/:id/edit',
    name: DrawerRouteEnum.WORKORDER_EDITION,
  },
  {
    path: '/home/workorder/:id',
    name: DrawerRouteEnum.WORKORDER_VIEW,
  },
  {
    path: '/home/workorder/:id/task/:taskid',
    name: DrawerRouteEnum.TASK_VIEW,
  },
  {
    path: '/home/workorder/:id/cr',
    name: DrawerRouteEnum.REPORT,
  },
  {
    path: '/home/demande/:id',
    name: DrawerRouteEnum.DEMANDE,
  },
  {
    path: '/home/selection',
    name: DrawerRouteEnum.SELECTION,
  },
  {
    path: '/home/asset/new',
    name: DrawerRouteEnum.NEW_ASSET,
  },
  {
    path: '/home/geographical-selection',
    name: DrawerRouteEnum.GEOGRAPHICAL_SELECTION,
  },
  {
    path: '/home/itv/:id',
    name: DrawerRouteEnum.ITV_VIEW,
  },
];
