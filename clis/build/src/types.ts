import { Config } from '@walrus/build-types';

export interface Opts extends Config {
  watch?: boolean;
  stream?: boolean;
  rootPath?: string;
}
