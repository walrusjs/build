import { RollupAliasOptions } from '@rollup/plugin-alias';
// @ts-ignore
import { Format, Target } from '@walrus/rollup';

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
   * 替换代码
   * @rollup/plugin-replace
   */
  replace?: Record<string, string>;
}

export interface Opts extends Config {
  watch?: boolean;
  rootPath?: string;
}
