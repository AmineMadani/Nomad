import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ValueLabel } from 'src/app/core/models/util.model';
import { UtilsService } from 'src/app/core/services/utils.service';

@Component({
  selector: 'app-select-duplicate-report',
  templateUrl: './select-duplicate-report.component.html',
  styleUrls: ['./select-duplicate-report.component.scss'],
})
export class SelectDuplicateReportComponent implements OnInit {

  constructor(
    private modalController: ModalController,
    private utilsService: UtilsService
  ) { }

  // Variables which must be passed at param in the modal of this component
  @Input("listAssetTypeWtrReport") listAssetTypeWtrReport: ValueLabel[];

  public form: FormGroup;
  public isMobile: boolean;

  ngOnInit() {
    this.isMobile = this.utilsService.isMobilePlateform();
    // ### Form ### //
    this.form = new FormGroup({
      report: new FormControl(null, Validators.required),
    });
  }

  ok() {
    if (this.form.valid) {
      this.modalController.dismiss(this.form.get('report').value);
    }
  }

  cancel() {
    this.modalController.dismiss();
  }
}
