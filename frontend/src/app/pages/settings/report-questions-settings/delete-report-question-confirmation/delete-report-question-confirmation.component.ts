import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ReportQuestionDto } from 'src/app/core/models/reportQuestion.model';

@Component({
  selector: 'app-delete-report-question-confirmation',
  templateUrl: './delete-report-question-confirmation.component.html',
  styleUrls: ['./delete-report-question-confirmation.component.scss'],
})
export class DeleteReportQuestionConfirmationComponent implements OnInit {

  constructor(
    private modalController: ModalController,
  ) { }

  @Input() listReportQuestion: ReportQuestionDto[] = [];
  @Input() isUsedAsCondition: boolean = false;

  isAcknowledged = false;

  ngOnInit() {}

  ok() {
    this.modalController.dismiss(true);
  }

  close() {
    this.modalController.dismiss(false);
  }
}
