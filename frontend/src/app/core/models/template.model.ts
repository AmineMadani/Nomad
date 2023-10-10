export interface FormTemplate {
  fteId: number;
  formCode: string;
  fdnCode: string;
  ftcId: number;
  fdnId: number;
  definition: string;
}

export interface FormTemplateUpdate {
  fteId: number;
  fteCode: string;
  fdnId: number;
  fdnCode: string;
  fdnDefinition: string;
}