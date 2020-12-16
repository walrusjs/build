import { InputOptions, OutputOptions } from 'rollup';
import { Format, Target, Config, NormalizedConfig, PackageJson } from '@walrus/build-utils';

export type Task = {
  format: Format;
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}

export {
  Format,
  Target,
  Config,
  PackageJson,
  NormalizedConfig
}
