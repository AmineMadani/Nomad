export enum DrawerRouteEnum {
  HOME,
  PERIMETER,
  EXPLOITATION,
  PATRIMONY,
  EQUIPMENT,
  INTERVENTION,
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
    path: '/home/exploitation',
    name: DrawerRouteEnum.EXPLOITATION,
  },
  {
    path: '/home/patrimony',
    name: DrawerRouteEnum.PATRIMONY,
  },
  {
    path: '/home/equipment/:id',
    name: DrawerRouteEnum.EQUIPMENT,
  },
  {
    path: '/home/intervention/:id',
    name: DrawerRouteEnum.INTERVENTION
  }
];
