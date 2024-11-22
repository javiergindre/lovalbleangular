// Interfaces para el modelo de datos
export interface DynamicForm {
  postId: string;
  postUrl: string;
  formHeader: string;
  formSubmitButton: string;
  stepType: number;
  steps: Step[];
}

export interface Step {
  title: string;
  containerConfig: ContainerConfig;
  groups: FieldGroup[];
  subSteps?: Step[] | null; // Aquí permitimos substeps
}

export interface Row {
  fields: Field[];
}

export interface ContainerConfig {
  cssClass?: string;
}

export interface FieldGroup {
  groupName: string;
  groupConfig: GroupConfig;
  rows: Row[];
}

export interface GroupConfig {
  cssClass?: string;
}

export interface Field {
  name: string;
  label: string;
  type: string;
  value: any;
  validators?: string[] | null;
  apiUrl?: string | null;
  dependsOn?: string | null;
  queryParam?: string | null;
  format?: string | null;
  cssClass?: string | null;
  disabled?: boolean | null;
  tooltip?: string | null;
  options?: FieldOption[] | null;
  suffix?: string | null;
  dynamicComponent?: string | null;
}

export interface FieldOption {
  value: any; // Puede ser string, number, boolean, etc.
  label: string; // Texto visible para el usuario
}

export interface FormDataDto {
  postId: string;
  postUrl: string;
  jsonData: string;
}
