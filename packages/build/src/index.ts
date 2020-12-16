import { merge }  from 'lodash';
import { resolve, join } from 'path';
import { existsSync } from 'fs-extra';
import { getUserConfig } from './utils';
import build, { Opts } from './build';

const { getPackages } = require('@lerna/project');

export async function buildForLerna(opts: Opts) {
  const cwd = opts.cwd as string;
  const packages = await getPackages(cwd);

  for (const pkg of packages) {
    const pkgPath = pkg.contents;
    process.chdir(pkgPath);
    await build({
      ...opts,
      cwd: pkgPath,
      rootPath: cwd
    } as Opts);
  }
}

export default async function(opts: Opts) {
  const { watch, ...inputConfig } = opts;

  const cwd = resolve(inputConfig.cwd ?? '.');
  const userConfig = getUserConfig(cwd);
  const config = merge({}, inputConfig, userConfig);
  config.cwd = cwd;

  const useLerna = existsSync(join(cwd, 'lerna.json'));

  if (useLerna) {
    await buildForLerna({ ...config, watch });
  } else {
    await build({ ...config, watch });
  }
}

export * from './types';

