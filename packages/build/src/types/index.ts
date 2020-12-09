import { ModuleFormat } from 'rollup';
import { Alias } from '@rollup/plugin-alias';
import { Target, NodeEnv } from './global';
import { PackageJson } from './package-json';

export type Format = ModuleFormat;

export type LocalsConventionStr = 'camelCase' | 'camelCaseOnly' | 'dashes' | 'dashesOnly';
export type LocalsConventionFun = (originalClassName: string, generatedClassName: string, inputFile: string) => LocalsConventionStr;;

// https://github.com/css-modules/postcss-modules
export interface CssModules {
  scopeBehaviour?: 'global' | 'local';
  generateScopedName: string;
  exportGlobals: boolean;
  root: string;
  localsConvention: LocalsConventionStr | LocalsConventionFun;
  [key: string]: any;
}

interface SharedOpts {
  /**
   * 配置是 node 库还是 browser 库，只作用于语法层
   * @default `browser`
   */
  target?: Target;
  /**
   * 指定tsconfig.json文件的位置
   */
  tsconfig?: string;
}

export interface InputConfig extends SharedOpts {
  /**
   * 指定工作的目录
   */
  cwd?: string;
  /**
   * 指定入口文件
   * 会依次找 src/index.tsx, src/index.ts, src/index.jsx, src/index.js，如果存在，则会作为默认的 entry。
   */
  entry?: string | string[];
  /**
   * 指定入口文件
   */
  entries?: string[];
  /**
   * 指定在 UMD 和 IIFE 中公开的名称
   */
  name?: string;
  /**
   * 指定打包代码格式
   * @default `esm,cjs`
   */
  format?: string;
  /**
   * 禁用类型检查
   * @default false
   */
  disableTypeCheck?: boolean;
  /**
   * css modules 配置
   * @default false
   */
  cssModules?: boolean | CssModules;
  /**
   * 是否开始压缩
   * @default false
   */
  compress?: boolean;
  /**
   * 通配符配置, 默认`@`指向项目根目录的src目录
   */
  alias?: Alias[];
  /**
   * 是否生成 source map
   * @default true
   */
  sourcemap?: boolean;
  /**
   * 指定输出目录
   * @default `dist`
   */
  output?: string;
  /**
   * 是否开始监听模式
   */
  watch?: boolean;
  /**
   * 是否开启严格模式
   */
  strict?: boolean;
}

export interface Config extends InputConfig  {
  input?: string[];
  /**
   * 打包格式集合，内部使用
   */
  formats?: ModuleFormat[];
  /**
   * 是否打包多个文件，内部使用
   */
  multipleEntries?: boolean;
  /**
   * package.json
   */
  pkg?: {
    [key: string]: any
  }
}

export interface RunOptions {
  watch?: boolean
}

export interface NormalizedConfig {
  name?: string;
  input?: string[];
  entries?: string[];
}

export {
  Target,
  NodeEnv,
  PackageJson,
}
