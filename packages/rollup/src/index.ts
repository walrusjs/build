import path from 'path';
import { series } from 'asyncro';
import { merge } from 'lodash';
import { rollup, InputOptions, OutputOptions } from 'rollup';
import {
  DEFAULT_CONFIG_FILE,
  DEFAULT_CONFIG
} from './config';
import { PackageJson, Config, NormalizedConfig } from './types';
import { configLoader, normalizeConfig } from './utils';
import createConfig from './create-config';

interface Asset {
  absolute: string
  source: string
}
type Assets = Map<string, Asset>;

type Task = {
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}

export interface Options {
  /**
   * Log level
   */
  logLevel?: 'verbose' | 'quiet';
  rootDir: string;
}


class Bundler {
  private cwd: string;
  private pkg: PackageJson;
  private config: Config;
  private normalizedConfig: NormalizedConfig;
  public bundles: Set<Assets>;

  constructor(config: Config, options: Options) {
    this.cwd = path.resolve(options.rootDir || '.');

    this.pkg = configLoader
      .loadSync({
        files: ['package.json'],
        cwd: this.cwd
      }).data ?? {};

    const userConfig = configLoader.loadSync({
      files: DEFAULT_CONFIG_FILE,
      cwd: this.cwd,
      packageKey: 'wb'
    }).data ?? {};

    this.config = merge({}, DEFAULT_CONFIG, config, userConfig);
    this.bundles = new Set()
  }

  async run() {
    this.normalizedConfig = await normalizeConfig(this.cwd, this.config, this.pkg);
    const { formats, entries } = this.normalizedConfig;

    console.log(this.normalizedConfig);

    const tasks: Task[] = [];

    for (const entry of entries) {
      for (const format of formats) {
        tasks.push(createConfig({
          cwd: this.cwd,
          pkg: this.pkg,
          config: this.normalizedConfig,
          entry,
          format,
        }));
      }
    }

    console.log(tasks[0]);

    // await series(
    //   tasks.map(this.build)
    // );
  }

  async build(task: Task) {
    const { inputOptions, outputOptions } = task;
    const bundle = await rollup(inputOptions);

    await bundle.write(outputOptions);
    return true;
  }
}

export * from './types';
export default Bundler;
