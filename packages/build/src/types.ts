import { Format, Target, Config } from '@walrus/build-utils';

export { Format, Target, Config }
export interface Opts extends Config {
  watch?: boolean;
  rootPath?: string;
}
