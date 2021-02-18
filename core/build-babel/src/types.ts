import { Target, Format } from '@walrus/build-types';

export interface BabelOptions {
  /**
   * 当前的工作目录
   * @default `.`
   */
  cwd?: string;
  target?: Target;
  /**
   * 输出目录
   */
  outDir?: string;
  /**
   * 需要编译的目录
   */
  buildDir?: string | string[];
  /**
   * 是否开启监听
   */
  watch?: boolean;
  /**
   * 编译至相对于输入目录的输出目录
   */
  relative?: boolean;
  /**
   * 复制不会编译的文件
   */
  copyFiles?: boolean;
  /**
   * 拷贝忽略的文件
   */
  copyIgnored?: boolean;
  /**
   * 需要忽略的文件
   */
  ignore?: string[];
   /**
   * 编译和复制不可编辑文件时间，包含点文件
   */
  includeDotfiles?: boolean;
  /**
   * 设置需要编译的扩展列表，默认使用 [.es6，.js，.es，.jsx，.mjs]
   */
  extensions?: string[];
  /**
   * 保留输入文件的文件扩展名
   */
  keepFileExtension?: boolean;
  /**
   * 对输出文件使用特定的扩展名，默认使用 `.js`
   */
  outFileExtension?: string;
  sourceMaps?: boolean | 'inline' | 'both';
  verbose?: boolean;
}
