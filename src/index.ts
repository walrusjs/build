import rimraf from 'rimraf';
import { resolve, join } from 'path';
import { map } from 'asyncro';
import { merge } from 'lodash';
import { build as rollupBuild } from '@/rollup';
import { Config } from '@/types';
import { getExistFile, isFile, isDir } from '@/utils';
import { DEFAULT_CONFIG_FILE, DEFAULT_INPUT_FILE } from '@/config';
import configLoader from '@/utils/config-loader';
import resolveArgs, { Args } from '@/utils/resolve-args';

const DEFAULT_CWD = process.cwd();

const DEFAULT_CONDIG: Config = {
  cwd: DEFAULT_CWD,
  tsconfig: join(DEFAULT_CWD, './tsconfig.json'),
  target: 'browser',
  cssModules: false,
  formats: ['esm', 'cjs']
};

async function getEntries({ input, cwd }) {
	let entries = (
		await map([].concat(input), async file => {
			file = resolve(cwd, file);
			if (await isDir(file)) {
				file = resolve(file, 'index.js');
      }
      if (await isFile(file)) {
        return file;
      }
      return undefined;
		})
  )
  .filter((item, i, arr) => arr.indexOf(item) === i)
  .filter(Boolean);
	return entries;
}

async function getBundleConfig(argsConfig?: Config) {
  const { cwd = DEFAULT_CWD } = argsConfig;

  const userConfig = configLoader.loadSync({
    files: DEFAULT_CONFIG_FILE,
    cwd,
    packageKey: 'wBuild'
  });

  const latestConfig: Config = merge({}, DEFAULT_CONDIG, argsConfig, userConfig.data || {});

  const defaultEntry = getExistFile({
    cwd: latestConfig.cwd,
    files: DEFAULT_INPUT_FILE
  });

  latestConfig.entry = latestConfig.entry ?? [defaultEntry];

  latestConfig.target = latestConfig.target ?? 'browser';
  latestConfig.cssModules = latestConfig.cssModules ?? false;

  if (latestConfig.cwd !== DEFAULT_CWD) {
    latestConfig.tsconfig = join(latestConfig.cwd, 'tsconfig.json');
  }

  if (!isFile(latestConfig.tsconfig)) {
    latestConfig.tsconfig = undefined;
  }

  // 过滤掉不存在的文件
  latestConfig.entry = await getEntries({
    input: latestConfig.entry,
    cwd: latestConfig.cwd
  }) as string[];

  if (latestConfig.formats) {
    latestConfig.formats = latestConfig.formats
      .map(item => {
        if (item === 'commonjs') {
          return 'cjs'
        }
        if (item === 'es') {
          return 'esm'
        }
        return item
      });
  }

  return latestConfig;
}

async function build(args: Args) {
  const argsConfig = resolveArgs(args);

  if (argsConfig.cwd === '.') {
    argsConfig.cwd = DEFAULT_CWD;
  }

  // 获取配置优先级 配置文件 > 命令行 > 默认
  const latestConfig = await getBundleConfig(argsConfig);

  if (!latestConfig.entry?.length) {
    return;
  }

  // 删除构建目录
  rimraf.sync(resolve(latestConfig.cwd, `dist`));

  await rollupBuild(latestConfig);
}

export default build;
