import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Workorder, Task } from 'src/app/core/models/workorder.model';

@Component({
  selector: 'app-report-footer-actions',
  templateUrl: './report-footer-actions.component.html',
  styleUrls: ['./report-footer-actions.component.scss'],
})
export class ReportFooterActionsComponent {
  @Input() isMobile: boolean;
  @Input() isSubmitting: boolean;
  @Input() step: number;
  @Input() workorder: Workorder;
  @Input() hasPreviousQuestion: boolean;
  @Input() isTest: boolean;
  @Input() hasXYInvalid: boolean;
  @Input() hasReportClosed: boolean;
  @Input() isSubmit: boolean;
  @Input() selectedTasks: Task[];

  @Output() private onEditTask = new EventEmitter<void>();
  @Output() private onNewAsset = new EventEmitter<void>();
  @Output() private onBack = new EventEmitter<void>();
  @Output() private onNext = new EventEmitter<void>();
  @Output() private onPreviousFormQuestion = new EventEmitter<void>();
  @Output() private onNextFormQuestion = new EventEmitter<void>();
  @Output() private onConfirmDate = new EventEmitter<void>();
  @Output() private onFormSubmit = new EventEmitter<boolean>();
  @Output() private onGoToFirstStep = new EventEmitter<void>();

  onEditTaskEmit(): void {
    this.onEditTask.emit();
  }

  onNewAssetEmit(): void {
    this.onNewAsset.emit();
  }

  onBackEmit(): void {
    this.onBack.emit();
  }

  onNextEmit(): void {
    this.onNext.emit();
  }

  onPreviousFormQuestionEmit(): void {
    this.onPreviousFormQuestion.emit();
  }

  onNextFormQuestionEmit(): void {
    this.onNextFormQuestion.emit();
  }

  onConfirmDateEmit(): void {
    this.onConfirmDate.emit();
  }

  onFormSubmitEmit(isReportClosed: boolean = false): void {
    this.onFormSubmit.emit(isReportClosed);
  }

  onGoToFirstStepEmit(): void {
    this.onGoToFirstStep.emit();
  }
}
