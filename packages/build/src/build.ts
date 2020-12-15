import { merge }  from 'lodash';
import { resolve, parse } from 'path';
// @ts-ignore
import RollupBundler from '@walrus/rollup';
import { DEFAULT_CONFIG } from './config';
import { getUserConfig, randomColor } from './utils';
import { Opts } from './types';

async function build({ watch, rootPath, ...inputConfig }: Opts) {
  // @ts-ignore
  const cwd: string = resolve(inputConfig.cwd as string);
  const userConfig = getUserConfig(cwd);
  const config = merge({}, DEFAULT_CONFIG, inputConfig, userConfig);

  let dirName: string | undefined;

  if (rootPath && cwd !== rootPath) {
    dirName = randomColor(parse(cwd).name);
  }

  // @ts-ignore
  const bundler = new RollupBundler(config);

  try {
    if (watch === true) {
      await bundler.run({ watch, prefixText: dirName });
    } else {
      await bundler.run({ prefixText: dirName });
    }
    return 'success';
  } catch (e) {
    return e;
  }
}

export * from './types';
export default build;

