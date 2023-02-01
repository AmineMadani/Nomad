import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainToolbarComponent } from '../components/main-toolbar/main-toolbar.component';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [
    MainToolbarComponent
  ],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports:[
    MainToolbarComponent
  ]
})
export class SharedModule { }
