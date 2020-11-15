import { join } from 'path';
import { series } from 'asyncro';
import { rollup, InputOptions, OutputOptions, ModuleFormat } from 'rollup';
import createConfig from './create-config';
import { Config } from '@/types';

type Step = {
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}

const resolve = function(dir: string, filePath: string) {
  return join(dir, filePath)
}

async function build(opts: Config) {
  const entry = opts.entry as string[];
  const formats = opts.formats;

  function getSteps() {
    const steps: Step[] = [];

    for (let i = 0; i < entry.length; i++) {
      for (let j = 0; j < formats.length; j++) {
        const { inputOptions } = createConfig({
          ...opts,
          entry: entry[i],
          format: formats[j]
        });

        steps.push({
          inputOptions,
          outputOptions: {
            file: resolve(opts.cwd, `dist/index-${formats[j]}.js`),
            format: formats[j],
            name: formats[j] === 'umd' ? 'BasicCss' : undefined,
            exports: 'auto'
          }
        });
      }
    }

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
