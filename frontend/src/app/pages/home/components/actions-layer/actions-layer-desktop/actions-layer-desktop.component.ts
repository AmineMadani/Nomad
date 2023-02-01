import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-actions-layer-desktop',
  templateUrl: './actions-layer-desktop.component.html',
  styleUrls: ['./actions-layer-desktop.component.scss'],
})
export class ActionsLayerDesktopComponent implements OnInit {

  constructor() { }

  @Output() selectedActionEvent = new EventEmitter<string>();

  selectedAction:string = '';

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
