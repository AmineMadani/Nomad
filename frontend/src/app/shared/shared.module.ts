import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MainToolbarComponent } from './components/main-toolbar/main-toolbar.component';



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
