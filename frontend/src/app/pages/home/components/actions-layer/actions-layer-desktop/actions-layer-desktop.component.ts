import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-actions-layer-desktop',
  templateUrl: './actions-layer-desktop.component.html',
  styleUrls: ['./actions-layer-desktop.component.scss'],
})
export class ActionsLayerDesktopComponent implements OnInit {

  constructor() { }

  @Input() selectedAction: string = '';
  @Output() selectedActionEvent = new EventEmitter<string>();

  ngOnInit() {}

  onAction(selectedAction:string){
    if(this.selectedAction == selectedAction) {
      this.selectedAction = '';
    } else {
      this.selectedAction = selectedAction;
    }
    this.selectedActionEvent.emit(selectedAction);
  }

}
