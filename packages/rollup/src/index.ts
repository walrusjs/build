import path from 'path';
import rimraf from 'rimraf';
import ora from 'ora';
import { series } from 'asyncro';
import { merge } from 'lodash';
import { rollup } from 'rollup';
import {
  DEFAULT_CONFIG_FILE,
  DEFAULT_CONFIG
} from './config';
import {
  Task,
  Paths,
  PackageJson,
  Config,
  NormalizedConfig
} from './types';
import { configLoader, normalizeConfig, clearConsole } from './utils';
import createConfig from './create-config';
import doWatch from './do-watch';

interface Asset {
  absolute: string
  source: string
}

type Assets = Map<string, Asset>;

interface RunOptions {
  watch?: boolean
}

class Bundler {
  private cwd: string;
  private pkg: PackageJson;
  private paths: Paths;
  private config: Config;
  private hasPackageJson: boolean;
  private normalizedConfig: NormalizedConfig;
  public bundles: Set<Assets>;
  private spinner: ora.Ora;

  constructor(config: Config) {
    this.cwd = path.resolve(config.cwd || '.');

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

    this.spinner = ora({
      prefixText: `[wb]: `,
    });
  }

  resolveApp(relativePath: string) {
    return path.resolve(this.cwd, relativePath);
  };

  async run(options: RunOptions = {}) {
    // clearConsole();
    this.normalizedConfig = await normalizeConfig({
      cwd: this.cwd,
      config: this.config,
      pkg: this.pkg,
      hasPackageJson: this.hasPackageJson
    });
    const outputDir = path.dirname(this.normalizedConfig.output);

    // console.log(this.normalizedConfig);

    const cleanPromise = new Promise(resolve =>
      rimraf(
        outputDir,
        {
          disableGlob: true,
        },
        resolve,
      ),
    )

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

    if (options.watch === true) {
      this.spinner.start();

      return doWatch(
        {
          output: this.normalizedConfig.output,
          onStart: () => {
            this.spinner.text = 'watch start';
          },
          onBuildStart: () => {
            this.spinner.text = 'buld start';
          },
          onBuildEnd: () => {
            this.spinner.text = 'buld start';
          },
          onEnd: () => {
            this.spinner.text = 'watch end';
          },
          onError: (e, message) => {
            this.spinner.fail(`error: ${message}`);
          }
        },
        this.normalizedConfig.cwd,
        tasks
      );
    }

    this.spinner.start('build start');

    this.spinner.text = 'clean output dir';

    await cleanPromise;

    await series(
      tasks.map(config => async () => {
        const promise = this.build(config);

        this.spinner.text = `Building modules format ${config.format}`;

        let bundle = await promise;

        return bundle;
      })
    );

    this.spinner.succeed(
      `build sucess`
    )
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
