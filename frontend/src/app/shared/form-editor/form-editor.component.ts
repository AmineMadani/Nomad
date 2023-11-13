import {
  Component,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  EventEmitter,
  Output
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FormDefinition, Form } from './models/form.model';
import { FormRulesService } from './services/form-rules.service';
import { FormRelationService } from './services/form-relation.service';
import { Subject, takeUntil } from 'rxjs';
import { UtilsService } from 'src/app/core/services/utils.service';
import { ReportValue, Workorder } from 'src/app/core/models/workorder.model';

export interface FormNode {
  definition: FormDefinition;
  children?: FormNode[];
}

@Component({
  selector: 'app-form-editor',
  templateUrl: './form-editor.component.html',
  styleUrls: ['./form-editor.component.scss'],
})
export class FormEditorComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private rulesService: FormRulesService,
    private relationService: FormRelationService,
    private utils: UtilsService
  ) { }

  @Input() nomadForm: Form;
  @Input() tableName: string;
  @Input() editMode: boolean;
  @Input() indexQuestion = 0;
  @Input() resumeQuestions: ReportValue[];
  @Input() workorder: Workorder;
  @Output() submitAction: EventEmitter<FormGroup> = new EventEmitter();
  @Output() goToNextQuestion: EventEmitter<void> = new EventEmitter();

  public form: FormGroup;
  public sections: FormNode[] = [];
  public paramMap: Map<string, string>;
  public isMobile: boolean;

  private ngUnsubscribe$: Subject<void> = new Subject();


  ngOnInit() {
    this.isMobile = this.utils.isMobilePlateform();
    // Construct sections from form
    const urlParams = new URLSearchParams(window.location.search);
    this.paramMap = new Map(urlParams.entries());

    this.sections = this.buildTree(this.nomadForm.definitions);
    this.form = this.buildForm();
    this.relationService.setRelation(this.nomadForm.relations, this.form);

    this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe$)).subscribe(() => {
      this.relationService.checkRelation(this.nomadForm.relations, this.form);
    });

    setTimeout(() => {
      if(this.resumeQuestions){
        for(let question of this.resumeQuestions) {
          this.form.get(question.key).setValue(question.answer);
        }
      }
    });
  }

  /**
   * Checks if the edit mode has changed and updates the value accordingly.
   * @param {SimpleChanges} changes - SimpleChanges
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editMode']) {
      if (changes['editMode']) {
        const { currentValue, previousValue } = changes['editMode'];
        if (currentValue && !previousValue && !this.nomadForm.editable) {
          this.editMode = false;
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  /**
   * Builds a tree structure of FormNodes from an array of FormDefinitions for the templates
   * @param {FormDefinition[]} definitions - Represent the structure of a form.
   * @param {string} [section] - Optional string parameter that specifies the section FormNode belongs to.
   * @returns An array of FormNode objects is being returned.
   */
  public buildTree(definitions: FormDefinition[], section?: string): FormNode[] {
    const nodes: FormNode[] = [];
    for (const definition of definitions) {
      if (definition.section === section) {
        const node: FormNode = { definition };
        const children = this.buildTree(definitions, definition.key);
        if (children.length > 0) {
          node.children = children;
        }
        nodes.push(node);
      }
    }
    return nodes;
  }

  /**
   * Builds a FormGroup with FormControl objects based on an array of field definitions,
   * applying validation rules if specified.
   * @returns A FormGroup object is being returned.
   */
  public buildForm(): FormGroup {
    const controlsArray = this.nomadForm.definitions.map((field) => {
      const validators = [];
      if (field.rules) {
        for (const rule of field.rules) {
          validators.push(
            this.rulesService.createValidators(rule.key, rule.value, rule.message)
          );
        }
      }
      return [
        field.key,
        new FormControl(field.attributes.value, { validators }),
      ];
    });
    const controls = Object.fromEntries(controlsArray);
    return this.fb.group(controls);
  }

  public onSubmit(): void {
    this.submitAction.emit(this.form);
  }

  public onGoToNextQuestion(): void {
    this.goToNextQuestion.emit();
  }
}
