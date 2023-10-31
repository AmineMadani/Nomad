import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IonInput, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-value-label',
  templateUrl: './value-label.component.html',
  styleUrls: ['./value-label.component.scss'],
})
export class ValueLabelComponent implements OnInit {

  constructor(
    private modalController: ModalController,
  ) { }

  // Variables which must be passed at param in the modal of this component
  @Input("value") value: string;

  @ViewChild("label") labelInput: IonInput;

  public form: FormGroup;

  ngOnInit() {
    // ### Form ### //
    this.form = new FormGroup({
      label: new FormControl(null, Validators.required),
    });

    this.form.get('label').setValue(this.value);

    // Timeout to wait for the page to load
    setTimeout(() => {this.labelInput.setFocus()}, 100);
  }

  ok() {
    if (this.form.valid) {
      this.modalController.dismiss(this.form.get('label').value);
    }
  }

  cancel() {
    this.modalController.dismiss();
  }
}
