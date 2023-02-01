import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor() { }

  selectedContent:string = 'init';

  ngOnInit() {
  }

  onSelectAction(selectedAction:string) {
    if(selectedAction == this.selectedContent) {
      this.selectedContent = '';
    } else {
      this.selectedContent=selectedAction;
    }
  }

}
