export interface Form {
  key: string;
  editable: boolean;
  definitions: FormDefinition[];
  relations: FormRelation[];
}

export interface FormDefinition {
  key: string;
  type: string;
  editable: boolean;
  component: string;
  attributes: any;
  label: string;
  section?: string;
  rules: FormRule[];
  displayCondition?: FormDisplayCondition;
}

export interface FormSection {
  key: string;
  type: string;
  children: any[];
}

export interface FormRule {
  key: string;
  value: string | number | boolean;
  message: string;
}

export enum RelationRuleEnum {
  INFERIOR_AS = 'inferiorAs',
  SUPERIOR_AS = 'superiorAs',
  ENABLE_AFTER = 'enableAfter',
}

export interface FormRelation {
  key: string;
  relatedFrom: string;
  relatedTo: string;
  relation: string;
  message: string;
  options: any
}

export interface FormInput {
  value: string;
  placeholder: string;
  default: string;
  predefineValue: string;
  type: string;
  hiddenNull: boolean;
}

export interface FormDatePicker {
  value: string;
  placeholder: string;
  default: string;
  type: string;
  hiddenNull: boolean;
  dateformat:string
}

export interface FormSelect {
  value: string;
  default: string;
  placeholder: string;
  options?: FormSelectOpt[];
  multiple?: boolean;
}

export interface FormSelectReferential {
  value: string;
  default: string;
  placeholder: string;
  repository: string,
  repositoryKey: string,
  repositoryValue: string
  filters?: string[]
}

export interface FormSelectOpt {
  key: string;
  value: string;
}

export interface FormTextaera {
  value: string;
  placeholder: string;
}

export interface FormLabel {
  value: string;
  default: string;
}

export interface FormAttachment {
  value: { filename: string, size: string }[]
}

export interface FormSlider {
  value: number,
  min: number,
  max: number
}

export enum FormPropertiesEnum {
  INPUT = 'input',
  SELECT = 'select',
  TEXTAERA = 'textaera',
}

export type FormComponent = FormInput | FormSelect | FormTextaera;

export const PREFIX_KEY_DEFINITION = 'UUID-';

export interface FormDisplayCondition {
  key: string;
  value: string[];
}