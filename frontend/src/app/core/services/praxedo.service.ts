import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { IntentAction } from 'plugins/intent-action/src';

@Injectable({
  providedIn: 'root'
})
export class PraxedoService {

  constructor(
    private router: Router
  ) {}

  public externalReport: string | undefined;

  public gps

  public praxedoListener() {
    IntentAction.addListener('appActionIntent', res => {
      if(res.extras.refextint) {
        this.externalReport = res.extras.refextint;
      }
      if(this.externalReport){
        this.router.navigate(["/home/workorder/"+this.externalReport+"/cr"]);
      }
    });
  }
}
