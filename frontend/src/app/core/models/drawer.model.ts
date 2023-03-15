export enum DrawerRouteEnum {
  HOME,
  PERIMETER,
  INTERVENTION,
  PATRIMONY,
  EQUIPMENT,
}

export enum DrawerTypeEnum {
  BOTTOM_SHEET,
  DRAWER,
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
    path: '/home/intervention',
    name: DrawerRouteEnum.INTERVENTION,
  },
  {
    path: '/home/patrimony',
    name: DrawerRouteEnum.PATRIMONY,
  },
  {
    path: '/home/equipment/:id',
    name: DrawerRouteEnum.EQUIPMENT,
  },
];
