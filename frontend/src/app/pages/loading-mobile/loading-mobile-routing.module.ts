import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoadingMobilePage } from './loading-mobile.page';

const routes: Routes = [
  {
    path: '',
    component: LoadingMobilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadingMobilePageRoutingModule {}
