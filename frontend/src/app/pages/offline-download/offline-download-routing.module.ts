import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OfflineDownloadPage } from './offline-download.page';

const routes: Routes = [
  {
    path: '',
    component: OfflineDownloadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OfflineDownloadPageRoutingModule {}
