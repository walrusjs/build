import rimraf from 'rimraf';
import path from 'path';
import { merge, isString } from 'lodash';
import { build as rollupBuild } from '@/rollup';
import { Config, Format, InputConfig, PackageJson, NormalizedConfig, RunOptions } from '@/types';
import { isFile } from '@/utils';
import { DEFAULT_CONFIG_FILE, DEFAULT_FORMATS } from '@/config';
import configLoader from '@/utils/config-loader';
import { getInput, getOutput, getEntries } from '@/utils/resolve-options';
import { getConfigFromPkgJson, getName } from '@/utils/package-info';

const DEFAULT_CWD = process.cwd();

const DEFAULT_CONDIG: Config = {
  cwd: DEFAULT_CWD,
  tsconfig: path.join(DEFAULT_CWD, './tsconfig.json'),
  target: 'browser',
  cssModules: false,
  format: DEFAULT_FORMATS,
};

interface Options {
  /**
   * The root directory to resolve files from
   * Useful for mono-repo
   */
  rootDir?: string;
}

async function build(inputOptions: InputConfig) {
  let options = { ...inputOptions };

  options.cwd = path.resolve(process.cwd(), inputOptions.cwd);
	const cwd = options.cwd;

  /**
   * 读取配置文件
   */
  const userConfig = configLoader.loadSync({
    files: DEFAULT_CONFIG_FILE,
    cwd,
    packageKey: 'wBuild'
  });

  const argsConfig: InputConfig = {
    cwd: inputOptions.cwd,
    name: inputOptions.name,
    entries: inputOptions.entries,
    output: inputOptions.output,
    format: inputOptions.format,
    watch: inputOptions.watch,
    target: inputOptions.target,
    strict: inputOptions.strict,
    sourcemap: inputOptions.sourcemap,
    tsconfig: inputOptions.tsconfig,
  };

  // 获取配置优先级 配置文件 > 命令行 > 默认
  const config: Config = merge({}, DEFAULT_CONDIG, argsConfig, userConfig.data || {});

  // 处理cwd
  config.cwd = path.resolve(process.cwd(), config.cwd);

  // 读取package.json
  const { hasPackageJson, pkg } = await getConfigFromPkgJson(cwd);
  config.pkg = pkg;

  // 兼容 entry
  if (config.entry) {
    config.entries = Array.isArray(config.entry)
      ? config.entry
      : (isString(config.entry) && config.entry ? [config.entry] : config.entries)
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

  console.log(config.input);

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

  config.formats = (config.format).split(',') as Format[];
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
    config.tsconfig = path.join(config.cwd, 'tsconfig.json');
  }

  if (! await isFile(config.tsconfig)) {
    config.tsconfig = undefined;
  }

  if (config.sourcemap !== false) {
		config.sourcemap = true;
  }

  if (config.entries?.length && config.formats?.length) {
    // 删除构建目录
    rimraf.sync(path.resolve(cwd, `dist`));

    await rollupBuild(config);
  }
}

export default build;
