import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loading',
  templateUrl: './skeleton-loading.component.html',
  styleUrls: ['./skeleton-loading.component.scss'],
})
export class SkeletonLoadingComponent implements OnInit {
  constructor() {}

  @Input() public rows: number;
  @Input() public subrows?: boolean = true;

  public rowsArray: number[];

  ngOnInit() {
    this.rowsArray = Array.from({ length: this.rows }, (_, index) => index + 1);
  }
}
