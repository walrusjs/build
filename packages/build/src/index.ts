import { merge }  from 'lodash';
import path from 'path';
// @ts-ignore
import RollupBundler from '@walrus/rollup';
import { Config } from './types';
import { DEFAULT_CONFIG } from './config';
import { getUserConfig } from './utils';

export interface Opts extends Config {
  watch?: boolean;
}

async function build(opts: Opts) {
  const { watch, ...inputConfig } = opts;

  const cwd = path.resolve(inputConfig.cwd ?? '.');
  const userConfig = getUserConfig(cwd);
  const config = merge({}, DEFAULT_CONFIG, inputConfig, userConfig);

  console.log(config)

  const bundler = new RollupBundler(config);

  try {
    if (opts.watch === true) {
      await bundler.run({ watch: opts.watch });
    } else {
      await bundler.run();
    }
    return 'success';
  } catch (e) {
    return e;
  }
}

export * from './types';
export default build;

