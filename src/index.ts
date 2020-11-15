import rimraf from 'rimraf';
import { resolve, join } from 'path';
import { Config } from '@/types';
import { build as rollupBuild } from '@/rollup';
import configLoader from '@/utils/config-loader';

// 配置文件获取顺序
export const DEFAULT_CONFIG_FILE = [
  'wBuild.config.ts',
  'wBuild.config.js',
  '.wBuildrc.ts',
  '.wBuildrc.js'
];

async function build(options: Config) {
  const {
    cwd,
    target = 'browser',
    cssModules = false
  } = options;
  const tsconfig = options.tsconfig || join(cwd, 'tsconfig.json')

  // 删除构建目录
  rimraf.sync(resolve(cwd, `dist`));

  const userConfig = configLoader.loadSync({
    files: DEFAULT_CONFIG_FILE,
    cwd,
    packageKey: 'wBuild'
  });

  // 获取配置优先级 命令行 > 配置文件 > 默认

  // 配置文件存在
  if (userConfig.path) {
    console.log(userConfig.data);
  }

  await rollupBuild({
    ...options,
    target,
    cssModules,
    tsconfig
  })
}

export default build;
