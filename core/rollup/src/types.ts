import { InputOptions, OutputOptions } from 'rollup';
import { Format } from '@walrus/build-types';
import { Alias } from '@rollup/plugin-alias';
import {
  NormalizedConfig,
  Config,
  Banner,
  Target,
  PostcssModulesOptions
} from '@walrus/build-types';

export interface Asset {
  absolute: string
  source: string
}

export type Assets = Map<string, Asset>;

export type Task = {
  format: Format;
  inputOptions: InputOptions;
  outputOptions: OutputOptions;
}

/**
 * 编译配置
 */
export interface Options {
  /**
   * 当前的工作目录
   */
  cwd: string;
  /**
   * 指定入口文件
   */
  entries: string[];
  /**
   * 指定输出格式
   */
  formats: Format[];
  /**
   * 指定tsconfig.json
   */
  tsconfig?: string;
  /**
   * 是否向上查找tsconfig.json
   */
  findTsconfig?: boolean;
  /**
   * 是否禁用类型检查
   */
  disableTypeCheck?: boolean;
  /**
   * 别名设置
   */
  alias: Alias[];
  /**
   * 指定输出目录
   * @default `dist`
   */
  output?: string;
  /**
   * banner配置
   */
  banner?: Banner;
  /**
   * 配置是 node 库还是 browser 库，只作用于语法层
   * @default `browser`
   */
  target?: Target;
  /**
   * 替换代码
   * @rollup/plugin-replace
   */
  replace?: Record<string, string>;
  /**
   * css-modules配置
   * 透传给 https://github.com/css-modules/postcss-modules
   */
  cssModules?: Partial<PostcssModulesOptions>;
}

export interface RunOptions {
  watch?: boolean;
  prefixText?: string;
}

export {
  Config,
  NormalizedConfig
}
