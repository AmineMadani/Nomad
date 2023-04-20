import { Component, OnInit, Input } from '@angular/core';
import { FormDefinition, FormSlider } from '../../models/form.model';

@Component({
  selector: 'app-form-slider',
  templateUrl: './form-slider.component.html',
  styleUrls: ['./form-slider.component.scss'],
})
export class FormSliderComponent implements OnInit {
  constructor() {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  @Input() edit: boolean;
  public attributes: FormSlider;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormSlider;
  }

  pinFormatter(value: number) {
    return `${value}`;
  }
}
