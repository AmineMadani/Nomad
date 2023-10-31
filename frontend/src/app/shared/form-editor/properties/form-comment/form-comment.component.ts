import { Component, Input, OnInit } from '@angular/core';
import { FormDefinition, FormInput } from '../../models/form.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-form-comment',
  templateUrl: './form-comment.component.html',
  styleUrls: ['./form-comment.component.scss'],
})
export class FormCommentComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  @Input() definition: FormDefinition;
  @Input() control: any;
  @Input() edit: boolean;

  public attributes: FormInput;

  ngOnInit() {
    this.attributes = this.definition.attributes as FormInput;
  }

  checkIfRuleExist(ruleKey:string): boolean {
    return this.definition.rules.some(rule => rule.key == ruleKey);
  }
}