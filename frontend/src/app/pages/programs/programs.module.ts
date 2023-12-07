import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgramsPageRoutingModule } from './programs-routing.module';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { ProgramsPage } from './programs.page';

@NgModule({
  declarations: [
    ProgramsPage
  ],
  imports: [
    CommonModule,
    ProgramsPageRoutingModule,
    IonicModule,
    SharedModule,
    HttpClientModule,
  ],
})
export class ProgramsModule { }
