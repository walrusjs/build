import { ModuleFormat } from 'rollup';

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

export interface Config {
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
}

export interface InputConfig {

}
