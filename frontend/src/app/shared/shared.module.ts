import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MainToolbarComponent } from './components/main-toolbar/main-toolbar.component';
import { DatepickerComponent } from './components/datepicker/datepicker.component';



@NgModule({
  declarations: [
    MainToolbarComponent,
    DatepickerComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports:[
    MainToolbarComponent,
    DatepickerComponent
  ]
})
export class SharedModule { }
