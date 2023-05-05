import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-form-work-order',
  templateUrl: './form-work-order.component.html',
  styleUrls: ['./form-work-order.component.scss'],
})
export class FormWorkOrderComponent implements OnInit {
  constructor() {}

  public n: number[] = [];

  ngOnInit() {
    for (let i = 1; i < 15; i++) {
      this.n.push(i);
    }
  }
}
