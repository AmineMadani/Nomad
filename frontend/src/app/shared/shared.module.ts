import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MainToolbarComponent } from './components/main-toolbar/main-toolbar.component';
import { DatepickerComponent } from './components/datepicker/datepicker.component';
// FORM EDITOR
import { FormEditorComponent } from './form-editor/form-editor.component';
// FORM SECTIONS
import { FormAccordionComponent } from './form-editor/sections/form-accordion/form-accordion.component';
import { FormStepComponent } from './form-editor/sections/form-step/form-step.component';
import { FormListComponent } from './form-editor/sections/form-list/form-list.component';
import { FormStepperComponent } from './form-editor/sections/form-stepper/form-stepper.component';
// FORM PROPERTIES
import { FormDatepickerComponent } from './form-editor/properties/form-datepicker/form-datepicker.component';
import { FormInputComponent } from './form-editor/properties/form-input/form-input.component';
import { FormSelectComponent } from './form-editor/properties/form-select/form-select.component';
import { FormTextaeraComponent } from './form-editor/properties/form-textaera/nomad-textaera.component';
import { FormLabelComponent } from './form-editor/properties/form-label/form-label.component';
import { FormAttachmentComponent } from './form-editor/properties/form-attachment/form-attachment.component';
import { FormSliderComponent } from './form-editor/properties/form-slider/form-slider.component';
import { ImageReaderComponent } from './components/image-reader/image-reader.component';

@NgModule({
  declarations: [
    // COMPONENTS
    MainToolbarComponent,
    DatepickerComponent,
    ImageReaderComponent,
    // FORM EDITOR
    FormEditorComponent,
    // SECTIONS
    FormAccordionComponent,
    FormListComponent,
    FormStepComponent,
    FormStepComponent,
    FormStepperComponent,
    // PROPERTIES
    FormDatepickerComponent,
    FormInputComponent,
    FormSelectComponent,
    FormTextaeraComponent,
    FormLabelComponent,
    FormAttachmentComponent,
    FormSliderComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
  ],
  exports:[
    MainToolbarComponent,
    DatepickerComponent,
    ImageReaderComponent,
    FormEditorComponent,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SharedModule { }
