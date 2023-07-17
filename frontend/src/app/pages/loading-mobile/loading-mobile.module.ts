import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoadingMobilePageRoutingModule } from './loading-mobile-routing.module';

import { LoadingMobilePage } from './loading-mobile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoadingMobilePageRoutingModule
  ],
  declarations: [LoadingMobilePage]
})
export class LoadingMobilePageModule {}
