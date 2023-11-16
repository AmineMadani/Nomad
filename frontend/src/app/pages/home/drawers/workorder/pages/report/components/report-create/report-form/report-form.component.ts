import { AfterViewChecked, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Report, Task, Workorder } from 'src/app/core/models/workorder.model';
import { TemplateService } from 'src/app/core/services/template.service';
import { UtilsService } from 'src/app/core/services/utils.service';
import { FormEditorComponent } from 'src/app/shared/form-editor/form-editor.component';
import { Form } from 'src/app/shared/form-editor/models/form.model';

@Component({
  selector: 'app-report-form',
  templateUrl: './report-form.component.html',
  styleUrls: ['./report-form.component.scss'],
})
export class ReportFormComponent implements OnInit, AfterViewChecked {

  constructor(
    private templateService: TemplateService,
    private utils: UtilsService,
    private cdRef: ChangeDetectorRef
  ) { }

  @Input() selectedTasks: Task[];
  @Input() reportForm: Form = null;
  @Input() isTest = false;
  @Input() workorder: Workorder;
  @Output() onSaveWorkOrderState: EventEmitter<void> = new EventEmitter();
  @Output() onClosedWko: EventEmitter<boolean> = new EventEmitter();
  @Output() goToDateStep: EventEmitter<void> = new EventEmitter();

  @ViewChild('formEditor') formEditor: FormEditorComponent;

  public form: Form;
  public indexQuestion: number=0;
  public isLoading: boolean = true;
  public isMobile: boolean = false;
  public hasPreviousQuestion: boolean = false;
  public canBeClosed: boolean = false;

  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();

    if (this.isTest) {
      this.form = this.reportForm;
      this.isLoading = false;
      return;
    }

    // Check if there's a previous question
    if (this.selectedTasks[0].report && this.selectedTasks[0].report.questionIndex > 0) {
      this.hasPreviousQuestion = true;
    }

    this.templateService.getFormsTemplate().then(forms => {
      let formTemplate = forms.find(form => form.formCode === 'REPORT_' + this.selectedTasks[0].astCode + '_' + this.selectedTasks[0].wtrCode);
      if (formTemplate) {
        this.form = JSON.parse(formTemplate.definition);
        if(this.selectedTasks[0].report?.questionIndex){
          this.indexQuestion = this.selectedTasks[0].report?.questionIndex;
        }
      }
      this.isLoading = false;
    });
  }

  // After the view is checked we look the form editor component
  // It permits to get the current question index
  // And then to check if the cr can be closed
  // We used the cdRef.detectChanges to avoid the NG0100 error
  // And the formEditorChecked variable permit to made the action only one time
  // To avoid performance issues
  private formEditorChecked = false;
  ngAfterViewChecked(): void {
    if (!this.formEditorChecked && this.formEditor) {
      if (this.formEditor.indexQuestion + 1 >= this.formEditor.sections[0].children.length) {
        this.canBeClosed = true;
        this.cdRef.detectChanges();
      }

      this.formEditorChecked = true;
    }
  }

  /**
   * Save the state of a workorder in cache
   */
  private saveWorkorderState() {
    if (this.isTest) return;

    let report: Report = {
      dateCompletion: null,
      reportValues: [],
      questionIndex: this.formEditor.indexQuestion
    };
    for (let definition of this.formEditor.nomadForm.definitions) {
      if (definition.type == 'property' && definition.isOptional !== true) {
        report.reportValues.push({
          key: definition.key,
          question: definition.label,
          answer: this.formEditor.form.value[definition.key]
        });
      }
    }
    for (let task of this.selectedTasks) {
      task.report = report;
    }

    this.onSaveWorkOrderState.emit();
  }

  /**
   * Action on click for the next question
   */
  public onNextFormQuestion() {
    let child = this.formEditor.sections[0].children[this.formEditor.indexQuestion];
    let childrens = child.children ? child.children : [child];
    let valid: boolean = true;
    for (let children of childrens) {
      this.formEditor.form.get(children.definition.key).updateValueAndValidity();
      this.formEditor.form.get(children.definition.key).markAsTouched();
      valid = valid && this.formEditor.form.get(children.definition.key).valid;
    }
    if (valid) {
      // Get the index of the next valid question
      this.formEditor.indexQuestion = this.getNextValidQuestionIndex(this.formEditor.indexQuestion);

      this.hasPreviousQuestion = true;
      // Check if it's the last question
      if (this.formEditor.indexQuestion + 1 >= this.formEditor.sections[0].children.length) {
        this.canBeClosed = true;
      }
      this.saveWorkorderState();
    }
  }

  /**
   * Action on click for the previous question
   */
  public onPreviousFormQuestion() {
    if (this.formEditor.indexQuestion > 0) {
      this.formEditor.indexQuestion = this.getPreviousValidQuestionIndex(this.formEditor.indexQuestion);

      if (this.formEditor.indexQuestion == 0) {
        this.hasPreviousQuestion = false
      }
      this.canBeClosed = false;
    }
    this.saveWorkorderState();
  }

  /**
   * Return the index of the previous valid question
   * It depends of the previous answer
   * @param currentIndex current question index
   * @returns the index of the preivous valide question
   */
  getPreviousValidQuestionIndex(currentIndex: number): number {
    let previousValidQuestionIndex = currentIndex - 1;

    // Check if the previous question can be skip (depending on previous answers)
    // If there is a previous question
    if (previousValidQuestionIndex > 0) {
      // Get the previous question
      let previousChild = this.formEditor.sections[0].children[previousValidQuestionIndex];

      // If there is a condition
      if (previousChild.definition.displayCondition != null) {
        // Get the answer of the question of the condition
        const answer = this.formEditor.form.get(previousChild.definition.displayCondition.key).value;

        // List of correct answer needed to display the question
        const listCorrectAnswer = previousChild.definition.displayCondition.value;

        let conditionIsMet = false;

        // If the question can have multiple value selected
        if (answer instanceof Array) {
          // Transform the answer into a list
          let listAnswer: string[] = [];
          if (answer != null) listAnswer = answer as Array<string>;

          // If the condition is not met
          conditionIsMet = listCorrectAnswer.some((correctAnswer) => listAnswer.includes(correctAnswer));
        } else {
          conditionIsMet = listCorrectAnswer.includes(answer);
        }

        if (!conditionIsMet) {
          // Skip the previous question
          // So we search the index of the previous valid question
          previousValidQuestionIndex = this.getPreviousValidQuestionIndex(previousValidQuestionIndex);
        }
      }
    }

    return previousValidQuestionIndex;
  }

  /**
   * Return the index of the next valid question
   * It depends of the previous answer
   * @param currentIndex current question index
   * @returns the index of the next valide question
   */
  getNextValidQuestionIndex(currentIndex: number): number {
    let nextValidQuestionIndex = currentIndex + 1;

    // Check if the next question can be skip (depending on previous answers)
    // If there is a next question
    if (nextValidQuestionIndex < this.formEditor.sections[0].children.length) {
      // Get the next question
      let nextChild = this.formEditor.sections[0].children[nextValidQuestionIndex];

      // If there is a condition
      if (nextChild.definition.displayCondition != null) {
        // Get the answer of the question of the condition
        const answer = this.formEditor.form.get(nextChild.definition.displayCondition.key).value;

        // List of correct answer needed to display the question
        const listCorrectAnswer = nextChild.definition.displayCondition.value;

        let conditionIsMet = false;

        // If the question can have multiple value selected
        if (answer instanceof Array) {
          // Transform the answer into a list
          let listAnswer: string[] = [];
          if (answer != null) listAnswer = answer as Array<string>;

          // If the condition is not met
          conditionIsMet = listCorrectAnswer.some((correctAnswer) => listAnswer.includes(correctAnswer));
        } else {
          conditionIsMet = listCorrectAnswer.includes(answer);
        }

        if (!conditionIsMet) {
          // Skip the next question
          // So we search the index of the next valid question
          nextValidQuestionIndex = this.getNextValidQuestionIndex(nextValidQuestionIndex);
        }
      }
    }

    return nextValidQuestionIndex;
  }

  /**
   * count form question label
   * @return the label
   */
  public getReportProgress(): number {
    if (this.formEditor?.sections[0]?.children) {
      const total = this.formEditor.sections[0].children.length;
      let current = 0;

      if (this.selectedTasks && this.selectedTasks[0]?.report?.questionIndex) {
        current = this.selectedTasks[0].report.questionIndex;
      }
      return current / total;
    }
    return 0;
  }

  /**
   * Send the form
   */
  public onFormSubmit() {
    console.log('on form submit');
    let child = this.formEditor.sections[0].children[this.formEditor.indexQuestion];
    let childrens = child.children ? child.children : [child];
    let valid: boolean = true;
    for (let children of childrens) {
      this.formEditor.form.get(children.definition.key).updateValueAndValidity();
      this.formEditor.form.get(children.definition.key).markAsTouched();
      valid = valid && this.formEditor.form.get(children.definition.key).valid;
    }

    if (!valid) return;

    this.formEditor.form.updateValueAndValidity();
    this.formEditor.form.markAllAsTouched();

    if (!this.utils.isMobilePlateform() && this.workorder.tasks.length == 1) {
      this.completeForm();
      this.goToDateStep.emit();
    }
    else {
      this.completeForm();
      this.onClosedWko.emit();
    }
  }

  /**
   * Complete the workorder with report validation
   */
  private completeForm(): void {
    console.log('complete form');

    let report: Report = {
      dateCompletion: new Date(),
      reportValues: [],
      questionIndex: this.formEditor.indexQuestion
    };
    for (let definition of this.formEditor.nomadForm.definitions) {
      if (definition.type == 'property' && definition.isOptional !== true) {
        report.reportValues.push({
          key: definition.rqnCode + '_' + definition.key,
          question: definition.label,
          answer: this.formEditor.form.value[definition.key] instanceof Array ?
            this.formEditor.form.value[definition.key].join('; ')
            : this.formEditor.form.value[definition.key]
        });
      }
    }
    for (let task of this.selectedTasks) {
      task.report = report;
      task.isSelectedTask = false;
    }

    this.onSaveWorkOrderState.emit();
  }
}
