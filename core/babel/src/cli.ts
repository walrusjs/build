#!/usr/bin/env node
import { cac } from 'cac';
import { BabelOptions } from './types';
import build from './';

const cli = cac(`wbb`);

cli
  .command('[...dirs]')
  .option('--cwd <cwd>', `[string] 设置工作目录 (默认: 当前目录)`)
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
    '--format <format>',
    `['esm' | 'cjs'] 设置编译格式`,
    {
      default: 'esm'
    }
  )
  .option(
    '--out-dir <outDir>',
    `[string] 设置输出目录`,
    {
      default: 'dist'
    }
  )
  .option(
    '--copy-files',
    `[boolean] 复制不会编译的文件`,
    {
      default: true
    }
  )
  .option('--copy-ignored', `[boolean] 拷贝忽略的文件`)
  .option('--ignore [...ignore]', `[string[]] 需要忽略的文件`)
  .option('--extensions [extensions]', `[string] 需要编译的文件后缀`)
  .example('--extensions .js,.ts,.jsx,.tsx')
  .action(async (dirs: string, options: any) => {
    // TODO: 添加对命令行参数的校验
    /** 对命令行参数进行解析 */
    const opts: BabelOptions = {
      cwd: options.cwd,
      target: options.target,
      outDir: options.outDir,
      watch: !!options.watch,
      copyFiles: !!options.copyFiles,
      buildDir: dirs.length ? dirs : undefined,
      copyIgnored: !!options.copyIgnored,
      ignore: Array.isArray(options.ignore)
        ? options.ignore
        : (options.ignore ? [options.ignore] : undefined),
      extensions: options.extensions ? options.extensions.split(',') : undefined
    }

    await build(opts);
  })

cli.help();
cli.version(require('../package.json').version);
cli.parse();
