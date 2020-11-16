import rimraf from 'rimraf';
import { resolve, join } from 'path';
import { merge, isString } from 'lodash';
import { build as rollupBuild } from '@/rollup';
import { Config } from '@/types';
import { isFile } from '@/utils';
import { DEFAULT_CONFIG_FILE } from '@/config';
import configLoader from '@/utils/config-loader';
import { getInput, getOutput, getEntries } from '@/utils/resolve-options';
import { getConfigFromPkgJson, getName } from '@/utils/package-info';
import resolveArgs, { Args } from '@/utils/resolve-args';

const DEFAULT_CWD = process.cwd();

const DEFAULT_CONDIG: Config = {
  cwd: DEFAULT_CWD,
  tsconfig: join(DEFAULT_CWD, './tsconfig.json'),
  target: 'browser',
  cssModules: false,
  formats: ['esm', 'cjs']
};

async function build(inputOptions: Args) {
  let options = { ...inputOptions };
  const argsConfig = resolveArgs(options);

  options.cwd = resolve(process.cwd(), inputOptions.cwd);
	const cwd = options.cwd;

  /**
   * 读取配置文件
   */
  const userConfig = configLoader.loadSync({
    files: DEFAULT_CONFIG_FILE,
    cwd,
    packageKey: 'wBuild'
  });

  // 获取配置优先级 配置文件 > 命令行 > 默认
  const config: Config = merge({}, DEFAULT_CONDIG, argsConfig, userConfig.data || {});

  config.cwd = resolve(process.cwd(), config.cwd);

  const { hasPackageJson, pkg } = await getConfigFromPkgJson(cwd);
  config.pkg = pkg;

  if (config.entry) {
    config.entries = Array.isArray(config.entry)
      ? config.entry
      : (isString(config.entry) && config.entry ? [config.entry] : [])
  }

  const { finalName, pkgName } = getName({
		name: config.name,
		pkgName: config.pkg.name,
		amdName: config.pkg.amdName,
		hasPackageJson,
		cwd,
  });

  config.name = finalName;
	config.pkg.name = pkgName;

  config.input = await getInput({
    cwd,
    entries: config.entries,
    source: config.pkg.source,
  });

  config.output = await getOutput({
		cwd,
		output: config.output,
		pkgMain: config.pkg.main,
		pkgName: config.pkg.name,
	});

  config.entries = await getEntries({
		cwd,
		input: config.input,
  });

  config.multipleEntries = config.entries.length > 1;

  config.formats = Array.from(
    new Set(config.formats.map(f => {
      if (f === 'esm') {
        return 'es'
      }
      if (f === 'commonjs') {
        return 'cjs'
      }
      return f
    }))
  )
  .sort((a, b) => (a === 'cjs' ? -1 : a > b ? 1 : 0));

  if (config.cwd !== DEFAULT_CWD) {
    config.tsconfig = join(config.cwd, 'tsconfig.json');
  }

  if (! await isFile(config.tsconfig)) {
    config.tsconfig = undefined;
  }

  if (config.sourcemap !== false) {
		config.sourcemap = true;
  }

  console.log(config);

  if (config.entries?.length) {
    // 删除构建目录
    rimraf.sync(resolve(cwd, `dist`));

    await rollupBuild(config);
  }
}

export default build;
