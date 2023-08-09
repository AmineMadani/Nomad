import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Form } from 'src/app/shared/form-editor/models/form.model';

@Component({
  selector: 'app-test-report',
  templateUrl: './test-report.component.html',
  styleUrls: ['./test-report.component.scss'],
})
export class TestReportComponent implements OnInit {

  constructor(
    private modalController: ModalController,
  ) { }

  // Variables which must be passed at param in the modal of this component
  @Input("reportForm") reportForm: Form;

  ngOnInit() {}

  close() {
    this.modalController.dismiss();
  }

}
