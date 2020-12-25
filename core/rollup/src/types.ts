import { InputOptions, OutputOptions } from 'rollup';
import { Format } from '@walrus/build-types';

export type Task = {
  format: Format;
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}
