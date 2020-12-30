import { resolve, join } from 'path';
import { existsSync } from 'fs-extra';
import { getUserConfig } from './utils';
import { DEFAULT_CONFIG } from './config';
import build, { Opts } from './build';
import { mergeConfig, clearConsole } from '@walrus/build-utils';
import buildForLerna from './build-for-lerna';

export default async function(opts: Opts) {
  const { watch, ...inputConfig } = opts;

  const cwd = resolve(inputConfig.cwd ?? '.');
  const userConfig = getUserConfig(cwd);
  const config = mergeConfig({}, DEFAULT_CONFIG, inputConfig, userConfig);
  config.cwd = cwd;

  const useLerna = existsSync(join(cwd, 'lerna.json'));

  // if (process.env.NO_CLEAR !== 'true') {
  //   // 清空控制台
  //   clearConsole();
  // }

  if (useLerna) {
    await buildForLerna({ ...config, watch });
  } else {
    await build({ ...config, watch });
  }
}

export * from './types';

