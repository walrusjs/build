import path from 'path';
import { rimraf, deleteEmptyDir } from '@walrus/build-utils';
import ora from 'ora';
import { series } from 'asyncro';
import { rollup } from 'rollup';
import {
  Task,
  PackageJson,
  Config,
  NormalizedConfig
} from './types';
import { configLoader, normalizeConfig, apiExtractor } from './utils';
import createConfig from './create-config';
import doWatch from './do-watch';

interface Asset {
  absolute: string
  source: string
}

type Assets = Map<string, Asset>;

interface RunOptions {
  watch?: boolean;
  prefixText?: string;
}

class Bundler {
  private cwd: string;
  private pkg: PackageJson;
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

    this.config = config;
    this.normalizedConfig = {} as NormalizedConfig;
    this.bundles = new Set();

    this.spinner = ora({
      prefixText: `[wb]: `,
    });
  }

  resolveApp(relativePath: string) {
    return path.resolve(this.cwd, relativePath);
  };

  async run(options: RunOptions = {}) {
    const { prefixText } = options;
    this.spinner = ora({
      prefixText: prefixText ? `${prefixText}: ` : undefined,
    });

    this.normalizedConfig = await normalizeConfig({
      cwd: this.cwd,
      config: this.config,
      pkg: this.pkg,
      hasPackageJson: this.hasPackageJson
    });

    const outputDir = path.dirname(this.normalizedConfig.output);

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
      this.spinner.start('watch start');

      return doWatch(
        {
          output: this.normalizedConfig.output,
          onStart: () => {
            this.spinner.text = 'build start';
          },
          onEnd: () => {
            this.spinner.text = 'build end';
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

    await apiExtractor(this.normalizedConfig);

    this.spinner.text = 'delete empty dir'
    await deleteEmptyDir(`${path.join(this.cwd, 'dist')}`)


    this.spinner.succeed(`build sucess`);
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
