import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-life-cycle',
  templateUrl: './form-life-cycle.component.html',
  styleUrls: ['./form-life-cycle.component.scss'],
})
export class FormLifeCycleComponent implements OnInit {
  constructor() {}

  public array: number[] = [];

  ngOnInit() {
    for (let i = 1; i < 10; i++) {
      this.array.push(i);
    }
  }
}
