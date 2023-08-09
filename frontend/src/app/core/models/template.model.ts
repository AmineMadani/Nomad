export interface FormTemplate {
  fteId: number;
  formCode: string;
  fdcId: number;
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