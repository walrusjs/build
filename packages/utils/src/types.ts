import { RollupAliasOptions, Alias } from '@rollup/plugin-alias';

/** JS target */
export type Target = 'node' | 'browser';

// 目前仅支持这三种格式，感觉满足需求了
export type Format = 'esm' | 'cjs' | 'umd';

export interface PackageJson {
  name: string;
  version: string;
  source?: string | string[];
  dependencies?: { [packageName: string]: string };
  devDependencies?: { [packageName: string]: string };
  engines?: {
    node?: string;
  };
  [key: string]: any;
}

export interface PostcssModulesOptions {
  root: string,
  scopeBehaviour: 'global' | 'local';
  exportGlobals: boolean;
  globalModulePaths: RegExp[];
  Loader: any;
  localsConvention: (originalClassName: string, generatedClassName: string, inputFile: string) => string | string | null;
  getJSON: (cssFileName: string, json: JSON, outputFileName: string) => void;
  generateScopedName: (name: string, filename: string, css: string) => string | string;
}

export interface Config {
  /**
   * 当前的工作目录
   * @default `.`
   */
  cwd?: string;
  /**
   * 指定在 UMD 和 IIFE 中公开的名称
   */
  name?: string;
  /**
   * 是否开启严格模式
   */
  strict?: boolean;
  /**
   * 是否生成sourcemap
   */
  sourcemap?: boolean;
  /**
   * 指定入口文件
   */
  entries?: string | string[];
  /**
   * 指定输出格式
   */
  format?: Format | Format[];
  /**
   * 指定tsconfig.json文件
   */
  tsconfig?: string;
  /**
   * 别名设置
   */
  alias?: RollupAliasOptions['entries'];
  /**
   * 指定输出目录
   * @default `dist`
   */
  output?: string;
  /**
   * 是否开启压缩
   */
  compress?: boolean;
  /**
   * 配置是 node 库还是 browser 库，只作用于语法层
   * @default `browser`
   */
  target?: Target;
  /**
   * 是否禁用类型检查
   */
  disableTypeCheck?: boolean;
  /**
   * 替换模式，推荐使用 `babel`
   * @default `babel`
   */
  replaceMode?: 'rollup' | 'babel',
  /**
   * css-modules配置
   * 透传给 https://github.com/css-modules/postcss-modules
   */
  cssModules?: Partial<PostcssModulesOptions>
  /**
   * 替换代码
   * @rollup/plugin-replace
   */
  replace?: Record<string, string>;
  typeExtractor?: {
    files?: string[]
    /**
     * 打包类型定义排除文件列表。
     */
    ignore?: string[]
    /**
     * 打包类型定义文件包括的包。
     */
    includedPackages?: string[]
  } | false;
}

export interface NormalizedConfig {
  /**
   * 当前的工作目录
   */
  cwd: string;
  /**
   * 是否开启严格模式
   */
  strict: boolean;
    /**
   * 是否生成sourcemap
   */
  sourcemap: boolean;
   /**
   * 是否开启压缩
   */
  compress: boolean;
  /**
   * 指定在 UMD 和 IIFE 中公开的名称
   */
  name?: string;
  /**
   * 指定入口文件
   */
  entries: string[];
  /**
   * 指定输出格式
   */
  formats: Format[];
  /**
   * 是否多个入口文件
   */
  multipleEntries: boolean;
  /**
   * 指定tsconfig.json文件
   */
  tsconfig?: string;
  /**
   * 别名设置
   */
  alias: Alias[];
  /**
   * 指定输出目录
   * @default `dist`
   */
  output: string;
  /**
   * 配置是 node 库还是 browser 库，只作用于语法层
   * @default `browser`
   */
  target: Target;
  /**
   * package.json
   */
  pkg: PackageJson;
  /**
   * package.json 是否存在
   */
  hasPackageJson: boolean;
  /**
   * 是否禁用类型检查
   */
  disableTypeCheck?: boolean;
  /**
   * 替换模式，推荐使用 `babel`
   * @default `babel`
   */
  replaceMode: 'rollup' | 'babel',
  /**
   * 替换代码
   * @rollup/plugin-replace
   */
  replace?: Record<string, string>;
  /**
   * css-modules配置
   */
  cssModules?: Partial<PostcssModulesOptions>;
  typeExtractor: {
    files?: string[]
    /**
     * 打包类型定义排除文件列表。
     */
    ignore?: string[]
    /**
     * 打包类型定义文件包括的包。
     */
    includedPackages?: string[]
  } | false;
}
