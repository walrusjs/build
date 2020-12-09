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
   * 指定在 UMD 和 IIFE 中公开的名称
   */
  name?: string;
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
   *
   */
  target?: Target;
}

export interface NormalizedConfig {
  /**
   * 当前的工作目录
   */
  cwd: string;
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
  alias?: Alias[];
  /**
   * 指定输出目录
   * @default `dist`
   */
  output?: string;
}

