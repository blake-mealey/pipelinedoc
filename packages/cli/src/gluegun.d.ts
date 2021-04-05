import 'gluegun';
import { DocExtension } from './extensions/doc-extension';

declare module 'gluegun' {
  export interface GluegunToolbox {
    doc?: DocExtension;
  }
}
