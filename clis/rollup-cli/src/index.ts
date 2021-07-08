#!/usr/bin/env node
import path from 'path';
import { cac, joycon, mergeConfig } from '@walrus/cli-utils';
import { getUserConfig } from '@walrus/build-utils'
import normalizeConfig from '@walrus/normalize-build-config';
import Bundler from '@walrus/rollup';

const cli = cac(`rollup-build`);

cli
  .command('[...entries]')
  .option('--cwd <cwd>', `[string] 设置工作目录`, { default: '.' })
  .option(
    '--watch',
    `[boolean] 是否开启监听`,
    {
      default: false
    }
   )
  .option(
    '--target <target>',
    `['node' | 'browser'] 配置是 node 库还是 browser 库`,
    {
      default: 'browser'
    }
  )
  .option(
    '--disable-type-check',
    `[boolean] 禁用类型检查`,
    {
      default: false
    }
  )
  .option('--name [name]', `[string] 指定UMD中的名称`)
  .option(
    '--strict',
    `[boolean] 是否开启严格模式`,
    {
      default: true
    }
   )
  .option(
    '--sourcemap',
    `[boolean] 是否生成sourcemap`,
    {
      default: true
    }
   )
  .option(
    '--format [format]',
    `['esm', 'cjs', 'umd'] 指定输出的格式`,
    {
      default: ['esm', 'cjs']
    }
  )
  .option('--tsconfig [tsconfig]', `指定ts配置文件tsconfig.json的路径`)
  .option(
    '--output [output]',
    `[string] 指定输出目录`,
    {
      default: 'dist'
    }
  )
  .option(
    '--compress',
    `[boolean] 是否开启压缩`,
    {
      default: true
    }
   )
  .option('--banner [banner]', `设置Banner信息`)
  .example('--banner.name @walrus/build-rollup --banner.version 1.0.0 --banner.author kang<kang@qq.com>')
  .action(async (entries: string[], opts: any) => {
    opts.cwd = path.resolve(opts.cwd);
    opts.entries = entries;

    const pkgInfo = joycon
      .loadSync({
        files: ['package.json'],
        cwd: opts.cwd
      });

    const userConfig = getUserConfig({
      cwd: opts.cwd,
      packageKey: 'build',
      files: [
        'build.config.ts',
        'build.config.js',
        '.buildrc.ts',
        '.buildrc.js'
      ]
    });

    const config = mergeConfig({}, opts, userConfig);

    const latestConfig = await normalizeConfig({
      cwd: opts.cwd,
      config,
      pkg: pkgInfo.data ?? {},
      hasPackageJson: !!pkgInfo.path
    });

    const bundler = new Bundler(latestConfig);

    await bundler.run({ watch: opts.watch });
  });

cli.help();
cli.version(require('../package.json').version);
cli.parse();
