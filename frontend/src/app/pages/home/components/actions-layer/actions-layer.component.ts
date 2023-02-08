import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-actions-layer',
  templateUrl: './actions-layer.component.html',
  styleUrls: ['./actions-layer.component.scss'],
})
export class ActionsLayerComponent implements OnInit {

  constructor(private utilsService: UtilsService) { }

  @Input() selectedAction: string = '';
  @Output() selectedActionEvent = new EventEmitter<string>();

  ngOnInit() {}

  onSelectAction(selectedAction:string) {
    this.selectedAction = selectedAction;
    this.selectedActionEvent.emit(selectedAction);
  }

  isMobile(): boolean {
    return this.utilsService.isMobilePlateform();
  }

}
