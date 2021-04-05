import { GluegunToolbox } from 'gluegun';
import {
  GenerateOptions,
  RepoMetaData,
  Template,
  TemplateMetaData
} from '../az-pipelines';
import {
  assertValidParameters,
  assertValidProperty,
  generateDocs,
  getGitUrl,
  getPropertiesFile,
  getRepoDetails,
  hadErrors,
  trackError,
  trackWarning
} from '../toolbox/doc-tools';

export interface DocExtension {
  trackWarning(message: string): void;
  trackError(message: string): void;
  hadErrors(): boolean;
  assertValidProperty(
    fileName: string,
    properties: Partial<TemplateMetaData>,
    property: keyof TemplateMetaData,
    type: string | string[],
    required?: boolean
  ): void;
  assertValidParameters(
    templateFileName: string,
    propertiesFileName: string,
    properties: Partial<TemplateMetaData>,
    template: Template
  ): void;
  getPropertiesFile(file: string): string;
  generateDocs(
    files: string[],
    generateOptions: Partial<GenerateOptions>,
    repoMeta: Partial<TemplateMetaData>,
    outputDir: string
  ): Promise<void>;
  getGitUrl(): Promise<any>;
  getRepoDetails(): Promise<RepoMetaData>;
}

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.doc = {
    trackWarning: (...args) => trackWarning(toolbox, ...args),
    trackError: (...args) => trackError(toolbox, ...args),
    hadErrors: () => hadErrors(),
    assertValidProperty: (...args) => assertValidProperty(toolbox, ...args),
    assertValidParameters: (...args) => assertValidParameters(toolbox, ...args),
    getPropertiesFile: (...args) => getPropertiesFile(toolbox, ...args),
    generateDocs: (...args) => generateDocs(toolbox, ...args),
    getGitUrl: () => getGitUrl(),
    getRepoDetails: () => getRepoDetails(toolbox)
  };
};
