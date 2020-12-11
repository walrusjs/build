import { ModuleFormat } from 'rollup';
import { RollupAliasOptions, Alias } from '@rollup/plugin-alias';

export type Format = ModuleFormat;

/** JS target */
export type Target = 'node' | 'browser';

export interface PackageJson {
  name: string;
  version: string;
  source?: string;
  dependencies?: { [packageName: string]: string };
  devDependencies?: { [packageName: string]: string };
  engines?: {
    node?: string;
  };
  [key: string]: any;
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
   * 配置是 node 库还是 browser 库，只作用于语法层
   * @default `browser`
   */
  target?: Target;
  /**
   * 是否禁用类型检查
   */
  disableTypeCheck?: boolean;
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
  hasPackageJson: boolean;
  /**
   * 是否禁用类型检查
   */
  disableTypeCheck?: boolean;
}

