import { ModuleFormat, ExternalOption } from 'rollup';
import { Alias } from '@rollup/plugin-alias';
import { MinifyOptions } from 'terser';

export type Target = 'node' | 'browser';

export type Format = ModuleFormat | 'modern';

interface BaseOptions {
  /**
   * 编译的工作目录
   */
  cwd: string;
  raw: string;
  compress: boolean;
  name: string;
  jsxFragment: string;
  strict: boolean;
  globals: string;
  jsxImportSource: string;
  define: any;
  /**
   * 配置是 node 库还是 browser 库，只作用于语法层
   */
  target: Target;
  jsx: string;
  tsconfig: string;
  input: string[];
  output: string;
  format: string;
  formats: string;
  multipleEntries: boolean;
  /**
   * 是否生成sourcemap
   */
  sourcemap: boolean;
  /**
   * 是否开启监听模式
   */
  watch: boolean;
  /**
   * package.json 信息
   */
  pkg: {
    [key: string]: any
  }
}

export interface Options extends BaseOptions {
  entries: string | string[];
  alias: string | Alias[];
  external: string;
}

export interface InternalOptions extends BaseOptions {
  entries: string[];
  alias: Alias[];
  format: Format;
  external: string | ExternalOption;
}

export {
  Alias,
  MinifyOptions
}