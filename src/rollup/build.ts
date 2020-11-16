import { series } from 'asyncro';
import { rollup, InputOptions, OutputOptions } from 'rollup';
import createConfig from './create-config';
import { Config } from '@/types';

type Step = {
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}

interface RollupBuildOptions extends Config {}

async function build(options: RollupBuildOptions) {
  const { entries, formats } = options;

  const steps: Step[] = [];

  for (let i = 0; i < entries.length; i++) {
    for (let j = 0; j < formats.length; j++) {
      const { inputOptions, outputOptions } = createConfig(
        options,
        entries[i],
        formats[j],
        i === 0 && j === 0,
      );

      steps.push({
        inputOptions,
        outputOptions
      });
    }
  }

  console.log(steps);

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
