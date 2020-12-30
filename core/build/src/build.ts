import { parse } from 'path';
import RollupBundler from '@walrus/rollup';
import { randomColor, configLoader } from '@walrus/build-utils';
import normalizeConfig from '@walrus/normalize-build-config';
import { Opts } from './types';

async function build({ watch, rootPath, stream, ...config }: Opts) {
  const cwd: string = config.cwd as string;

  const pkgInfo = configLoader
    .loadSync({
      files: ['package.json'],
      cwd
    });

  const _normalizedConfig = await normalizeConfig({
    cwd,
    config,
    pkg: pkgInfo.data ?? {},
    hasPackageJson: !!pkgInfo.path
  });

  let dirName: string | undefined;

  if (rootPath && cwd !== rootPath) {
    dirName = randomColor(parse(cwd).name);
  }

  const bundler = new RollupBundler(_normalizedConfig);

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

