import { parse } from 'path';
import RollupBundler from '@walrus/rollup';
import { randomColor } from './utils';
import { Opts } from './types';

async function build({ watch, rootPath, ...inputConfig }: Opts) {
  const cwd: string = inputConfig.cwd as string;

  let dirName: string | undefined;

  if (rootPath && cwd !== rootPath) {
    dirName = randomColor(parse(cwd).name);
  }

  const bundler = new RollupBundler(inputConfig);

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

