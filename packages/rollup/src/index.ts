import path from 'path';
import fs from 'fs-extra';
import rimraf from 'rimraf';
import { series } from 'asyncro';
import { merge } from 'lodash';
import progressEstimator from 'progress-estimator';
import { rollup, InputOptions, OutputOptions } from 'rollup';
import {
  DEFAULT_CONFIG_FILE,
  DEFAULT_CONFIG
} from './config';
import { PackageJson, Config, Format, NormalizedConfig } from './types';
import { configLoader, normalizeConfig } from './utils';
import createConfig from './create-config';

interface Asset {
  absolute: string
  source: string
}

type Assets = Map<string, Asset>;

type Task = {
  format: Format;
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}

interface Paths {
  progressEstimatorCache: string;
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
  private paths: Paths;
  private config: Config;
  private logger: progressEstimator.ProgressEstimator | null;
  private hasPackageJson: boolean;
  private normalizedConfig: NormalizedConfig;
  public bundles: Set<Assets>;

  constructor(config: Config, options: Options) {
    this.cwd = path.resolve(options.rootDir || '.');

    const pkgInfo = configLoader
      .loadSync({
        files: ['package.json'],
        cwd: this.cwd
      });

    this.pkg = pkgInfo.data ?? {};
    this.hasPackageJson = !!pkgInfo.path;

    const userConfig = configLoader.loadSync({
      files: DEFAULT_CONFIG_FILE,
      cwd: this.cwd,
      packageKey: 'wb'
    }).data ?? {};

    this.config = merge({}, DEFAULT_CONFIG, config, userConfig);
    this.normalizedConfig = {} as NormalizedConfig;
    this.bundles = new Set();
    this.paths = {
      progressEstimatorCache: this.resolveApp('node_modules/.cache/.progress-estimator')
    }
    this.logger = null;
  }

  resolveApp(relativePath: string) {
    return path.resolve(this.cwd, relativePath);
  };

  async createLogger() {
    await fs.ensureDir(this.paths.progressEstimatorCache);
    return progressEstimator({
      storagePath: this.paths.progressEstimatorCache,
    });
  }

  async run() {
    this.normalizedConfig = await normalizeConfig({
      cwd: this.cwd,
      config: this.config,
      pkg: this.pkg,
      hasPackageJson: this.hasPackageJson
    });
    this.logger = await this.createLogger();
    const outputDir = path.dirname(this.normalizedConfig.output);

    console.log(this.normalizedConfig);

    const cleanPromise = new Promise(resolve =>
      rimraf(
        outputDir,
        {
          disableGlob: true,
        },
        resolve,
      ),
    )

    this.logger?.(cleanPromise, `remove output dir`);

    const { formats, entries } = this.normalizedConfig;

    const tasks: Task[] = [];

    for (let i = 0; i < entries.length; i++) {
      for (let j = 0; j < formats.length; j++) {
        const rollupConfig = createConfig(
          {
            entry: entries[i],
            format: formats[j],
            config: this.normalizedConfig,
          },
          i === 0 && j === 0,
        );
        tasks.push({
          ...rollupConfig,
          format: formats[j],
        });
      }
    }

    await series(
      tasks.map(config => async () => {
        const promise = this.build(config);

        this.logger?.(promise, `Building modules format ${config.format}`);
        let bundle = await promise;

        return bundle;
      })
    );
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
