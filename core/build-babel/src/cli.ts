#!/usr/bin/env node
import { cac } from 'cac';

const cli = cac(`wbb`);

cli
  .command('[root]')
  .option('--cwd', `[string] 设置工作目录 (默认: 当前目录)`)

cli.help()
cli.version(require('../package.json').version)
cli.parse()
