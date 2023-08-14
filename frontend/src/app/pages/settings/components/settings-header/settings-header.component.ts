import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-settings-header',
  templateUrl: './settings-header.component.html',
  styleUrls: ['./settings-header.component.scss'],
})
export class SettingsHeaderComponent implements OnInit {

  @Input() title: string = '';
  @Input() isModalHeader: boolean = false;
  @Output() onModalClose: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit() { }

  onClose() {
    this.onModalClose.emit();
  }
}
