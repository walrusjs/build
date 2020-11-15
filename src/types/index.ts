import { ModuleFormat } from 'rollup';
import { Alias } from '@rollup/plugin-alias';

export type Target = 'node' | 'browser';

export type Format = ModuleFormat;

export type NodeEnv = 'development' | 'production' | 'test';

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

export interface InputConfig {
  /**
   * 指定编译的目录
   */
  cwd?: string;
  /**
   * 指定入口文件
   * 会依次找 src/index.tsx, src/index.ts, src/index.jsx, src/index.js，如果存在，则会作为默认的 entry。
   */
  entry?: string | string[];
  /**
   * 指定打包代码格式
   * @default `['esm', 'cjs']`
   */
  formats?: ModuleFormat[];
  /**
   * 配置是 node 库还是 browser 库，只作用于语法层
   * @default browser
   */
  target?: Target;
  /**
   * 禁用类型检查
   * @default false
   */
  disableTypeCheck?: boolean;
  /**
   * 指定tsconfig.json文件的位置，默认取
   */
  tsconfig?: string;
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
  alias?: Alias[]
}

export interface Config extends InputConfig  {

}
