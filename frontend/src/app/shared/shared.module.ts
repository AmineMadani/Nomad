import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
// COMPONENTS
import { MainToolbarComponent } from './components/main-toolbar/main-toolbar.component';
import { DatepickerComponent } from './components/datepicker/datepicker.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { SkeletonLoadingComponent } from './components/skeleton-loading/skeleton-loading.component';
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
import { AttachmentAccordionComponent } from './components/attachment-accordion/attachment-accordion.component';
import { ClearDataDirective } from './directives/clear-data.directive';
import { FormRadioComponent } from './form-editor/properties/form-radio/form-radio.component';
import { FormBottomAttachmentComponent } from './form-editor/properties/form-bottom-attachment/form-bottom-attachment.component';
import { FormLifeCycleComponent } from './form-editor/properties/form-life-cycle/form-life-cycle.component';
import { FormLayerReferenceComponent } from './form-editor/properties/form-layer-reference/form-layer-reference.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { SearchSelectComponent } from './components/search-select/search-select.component';
import { FormHistoryComponent } from './form-editor/properties/form-history/form-history.component';
import { FormEquipmentsComponent } from './form-editor/properties/form-equipments/form-equipments.component';
import { GenericTableComponent } from './components/generic-table/generic-table.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilterTableComponent } from './components/generic-table/filter-table/filter-table.component';
import { FormCommentComponent } from './form-editor/properties/form-comment/form-comment.component';

@NgModule({
  declarations: [
    // COMPONENTS
    MainToolbarComponent,
    DatepickerComponent,
    AttachmentAccordionComponent,
    PageHeaderComponent,
    SearchSelectComponent,
    GenericTableComponent,
    FilterTableComponent,
    SkeletonLoadingComponent,
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
    FormRadioComponent,
    FormHistoryComponent,
    FormBottomAttachmentComponent,
    FormLifeCycleComponent,
    FormLayerReferenceComponent,
    FormEquipmentsComponent,
    FormCommentComponent,
    // DIRECTIVES
    ClearDataDirective,
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatTabsModule,
    ScrollingModule,
    MatTooltipModule
  ],
  exports:[
    MainToolbarComponent,
    DatepickerComponent,
    AttachmentAccordionComponent,
    PageHeaderComponent,
    FormEditorComponent,
    ClearDataDirective,
    SearchSelectComponent,
    GenericTableComponent,
    SkeletonLoadingComponent,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SharedModule { }
