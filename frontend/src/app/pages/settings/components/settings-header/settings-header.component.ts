import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings-header',
  templateUrl: './settings-header.component.html',
  styleUrls: ['./settings-header.component.scss'],
})
export class SettingsHeaderComponent implements OnInit {

  @Input() title: string = '';

  constructor() { }

  ngOnInit() { }
}
