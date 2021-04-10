export interface RepoMetaData {
  identifier: string;
  type: 'git' | 'github' | 'bitbucket';
  name: string;
  ref?: string;
  endpoint?: string;
}

export interface ParameterMetaData {
  description?: string;
  format?: string;
}

export type ParametersMetaData = Record<string, ParameterMetaData>;

export interface TemplateMetaData {
  name: string;
  description?: string;
  version?: number | string;
  deprecated?: boolean;
  deprecatedWarning?: string;
  filePath?: string;
  repo?: RepoMetaData;
  parameters?: ParametersMetaData;
}

export interface GenerateOptions {
  headingDepth: number;
  generateFrontmatter: boolean;
}

export type TemplateParameterType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'step'
  | 'stepList'
  | 'job'
  | 'jobList'
  | 'deployment'
  | 'deploymentList'
  | 'stage'
  | 'stageList';

export interface TemplateParameter {
  name?: string;
  displayName?: string;
  type?: TemplateParameterType;
  default?: any;
  values?: string[];
}

export type TemplateParameters = TemplateParameter[] | Record<string, any>;

export interface Template {
  parameters?: TemplateParameters;
  steps?: any;
  jobs?: any;
  stages?: any;
  variables?: any;
}
