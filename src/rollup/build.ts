import { join } from 'path';
import rimraf from 'rimraf';
import { series } from 'asyncro';
import { rollup, InputOptions, OutputOptions, ModuleFormat } from 'rollup';
import createConfig from './create-config';
import { Config } from '@/types';

type Step = {
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}

const formats: ModuleFormat[] = ['es', 'commonjs', 'umd'];

const resolve = function(dir: string, filePath: string) {
  return join(dir, filePath)
}

async function build(opts: Config) {
  const {
    cwd,
    target = 'browser',
    cssModules = false
  } = opts;

  const tsconfig = opts.tsconfig || join(cwd, 'tsconfig.json')

  // 删除构建目录
  rimraf.sync(resolve(cwd, `dist`));

  function getSteps() {
    const steps: Step[] = [];

    formats.forEach(item => {
      const { inputOptions } = createConfig({
        ...opts,
        target,
        format: item,
        tsconfig,
        cssModules
      });

      steps.push({
        inputOptions,
        outputOptions: {
          file: resolve(cwd, `dist/index-${item}.js`),
          format: item,
          name: item === 'umd' ? 'BasicCss' : undefined,
          exports: 'auto'
        }
      });
    });

    return steps;
  }

  const steps = getSteps();

  await series(
    steps.map(config => async () => {
      const { inputOptions, outputOptions } = config;
      const bundle = await rollup(inputOptions);

      await bundle.write(outputOptions);
      return true;
    })
  );
}

export default build;
