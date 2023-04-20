import { Component, Input, OnInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
} from '@angular/forms';
import { FormDefinition, Form } from './models/form.model';
import { FormRulesService } from './services/form-rules.service';
import { FormRelationService } from './services/form-relation.service';
import { Subject, takeUntil } from 'rxjs';

export interface FormNode {
  definition: any;
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
    private relationService: FormRelationService
  ) {}

  @Input() nomadForm: Form;
  @Input() editMode: boolean;

  public form: FormGroup;
  public sections: FormNode[] = [];

  private ngUnsubscribe: Subject<void> = new Subject();

  ngOnInit() {
    // Construct sections from form
    this.sections = this.buildTree(this.nomadForm.definitions);
    this.form = this.buildForm();
    this.relationService.setRelation(this.nomadForm.relations, this.form);

    this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.relationService.checkRelation(this.nomadForm.relations, this.form);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { currentValue, previousValue } = changes['editMode'];
    if (currentValue && !previousValue && !this.nomadForm.editable) {
      this.editMode = false;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildTree(definitions: FormDefinition[], section?: string): FormNode[] {
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

  public buildForm(): FormGroup {
    const controlsArray = this.nomadForm.definitions
      .map((field) => {
        const validators = [];
        if (field.rules) {
          for (const rule of field.rules) {
            validators.push(
              this.rulesService.createValidators(rule.key, rule.value)
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
}
