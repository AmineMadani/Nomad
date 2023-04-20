import { Component, Input, OnInit } from '@angular/core';
import { FormNode } from '../../models/form-node.model';

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
})
export class FormListComponent implements OnInit {
  constructor() {}

  @Input() section: FormNode;

  ngOnInit() {}
}
