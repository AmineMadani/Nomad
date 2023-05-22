export enum DrawerRouteEnum {
  HOME = 'HOME',
  PERIMETER = 'PERIMETER',
  EXPLOITATION = 'EXPLOITATION',
  ASSET = 'ASSET',
  EQUIPMENT = 'EQUIPMENT',
  EQUIPMENT_DETAILS = 'EQUIPMENT_DETAILS',
  WORKORDER = 'WORKORDER',
  DEMANDE = 'DEMANDE',
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
    path: '/home/asset',
    name: DrawerRouteEnum.ASSET,
  },
  {
    path: '/home/equipment/:id',
    name: DrawerRouteEnum.EQUIPMENT,
  },
  {
    path: '/home/equipment/:id/details',
    name: DrawerRouteEnum.EQUIPMENT_DETAILS,
  },
  {
    path: '/home/work-order/:id',
    name: DrawerRouteEnum.WORKORDER,
  },
  {
    path: '/home/demande/:id',
    name: DrawerRouteEnum.DEMANDE,
  },
];
