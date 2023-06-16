import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SettingsTypeEnum as SettingsTypeEnum } from 'src/app/core/models/settings.model';

@Component({
  selector: 'app-settings-segment',
  templateUrl: './settings-segment.component.html',
  styleUrls: ['./settings-segment.component.scss'],
})
export class SettingsSegmentComponent implements OnInit {

  constructor() { }

  @Output() settingsTypeChange = new EventEmitter<SettingsTypeEnum>();

  public settingsType: SettingsTypeEnum = SettingsTypeEnum.PERSONNAL_SETTINGS;
  public SettingsSegmentEnum = SettingsTypeEnum;

  ngOnInit() { }

  onSegmentChange(event: any) {
    this.settingsType = event.detail.value;
    this.settingsTypeChange.emit(this.settingsType);
  }
}
