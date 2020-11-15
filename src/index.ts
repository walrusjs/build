import rimraf from 'rimraf';
import { resolve, join } from 'path';
import { merge } from 'lodash';
import { build as rollupBuild } from '@/rollup';
import { Config } from '@/types';
import { getExistFile, isFile } from '@/utils';
import { DEFAULT_CONFIG_FILE, DEFAULT_INPUT_FILE } from '@/config';
import configLoader from '@/utils/config-loader';

const DEFAULT_CWD = process.cwd();

const DEFAULT_CONDIG: Config = {
  cwd: DEFAULT_CWD,
  tsconfig: join(DEFAULT_CWD, 'tsconfig.json'),
  target: 'browser',
  cssModules: false,
};

function getBundleConfig(argsConfig?: Config) {
  const { cwd = DEFAULT_CWD } = argsConfig;

  const userConfig = configLoader.loadSync({
    files: DEFAULT_CONFIG_FILE,
    cwd,
    packageKey: 'wBuild'
  });

  const latestConfig: Config = merge({}, DEFAULT_CONDIG, userConfig.data || {}, argsConfig);

  latestConfig.entry = latestConfig.entry ?? getExistFile({
    cwd: latestConfig.cwd,
    files: DEFAULT_INPUT_FILE
  });

  latestConfig.target = latestConfig.target ?? 'browser';
  latestConfig.cssModules = latestConfig.cssModules ?? false;

  if (latestConfig.cwd !== DEFAULT_CWD) {
    latestConfig.tsconfig = join(latestConfig.cwd, 'tsconfig.json');
  }

  if (!isFile(latestConfig.tsconfig)) {
    delete latestConfig.tsconfig;
  }

  return latestConfig;
}

async function build(options: Config) {
  const { cwd = DEFAULT_CWD } = options;

  // 获取配置优先级 命令行 > 配置文件 > 默认
  const latestConfig = getBundleConfig(options);

  // 删除构建目录
  rimraf.sync(resolve(cwd, `dist`));

  await rollupBuild(latestConfig)
}

export default build;
