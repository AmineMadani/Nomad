import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-actions-layer',
  templateUrl: './actions-layer.component.html',
  styleUrls: ['./actions-layer.component.scss'],
})
export class ActionsLayerComponent implements OnInit {

  constructor() { }

  @Output() selectedActionEvent = new EventEmitter<string>();

  ngOnInit() {}

  onSelectAction(selectedAction:string) {
    this.selectedActionEvent.emit(selectedAction);
  }

}
