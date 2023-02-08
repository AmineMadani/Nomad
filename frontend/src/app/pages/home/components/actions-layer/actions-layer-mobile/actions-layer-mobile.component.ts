import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-actions-layer-mobile',
  templateUrl: './actions-layer-mobile.component.html',
  styleUrls: ['./actions-layer-mobile.component.scss'],
})
export class ActionsLayerMobileComponent implements OnInit {
  constructor() { }

  @Input() selectedAction: string = '';
  @Output() selectedActionEvent = new EventEmitter<string>();
  isOpen: boolean = false;

  ngOnInit() {}

  onAction(selectedAction: string) {
    this.selectedAction = this.selectedAction === selectedAction ? '' : selectedAction;
    this.isOpen = false;
    this.selectedActionEvent.emit(selectedAction);
  }

  openActionLayer(): void {
    this.isOpen = true;
  }

  closeActionLayer(): void {
    this.isOpen = false;
  }

}
