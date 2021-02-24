import path from 'path';
import { rimraf, deleteEmptyDir } from '@walrus/build-utils';
import ora from 'ora';
import { series } from 'asyncro';
import { rollup } from 'rollup';
import { NormalizedConfig } from '@walrus/build-types';
import apiExtractor from '@walrus/api-extractor';
import { Task } from './types';
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
  private config: NormalizedConfig;
  public bundles: Set<Assets>;
  private spinner: ora.Ora;

  constructor(config: NormalizedConfig) {
    this.cwd = config.cwd;
    this.config = config;
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

    const { formats, entries } = this.config;

    const tasks: Task[] = [];

    for (let i = 0; i < entries.length; i++) {
      for (let j = 0; j < formats.length; j++) {
        const rollupConfig = createConfig(
          {
            entry: entries[i],
            format: formats[j],
            config: this.config,
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
          output: this.config.output,
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
        this.config.cwd,
        tasks
      );
    }

    this.spinner.start('build start');

    const outputDir = path.dirname(this.config.output);

    const cleanPromise = new Promise(resolve =>
      rimraf(
        outputDir,
        {
          disableGlob: true,
        },
        resolve,
      ),
    )

    // 防止删除根目录
    if (path.relative(this.cwd, outputDir) === path.parse(outputDir).base) {
      this.spinner.text = 'clean output dir';
      await cleanPromise;
    }

    await series(
      tasks.map(config => async () => {
        const promise = this.build(config);

        this.spinner.text = `Building modules format ${config.format}`;

        let bundle = await promise;

        return bundle;
      })
    );

    await apiExtractor(this.config);

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

export default Bundler;
