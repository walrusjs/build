import { Config } from '../types';

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: Config = {
  format: ['esm', 'cjs'],
  output: 'dist'
}

/**
 * 入口文件默认顺序
 */
export const DEFAULT_INPUT_FILE = [
  'src/index.tsx',
  'src/index.ts',
  'src/index.jsx',
  'src/index.js',
  'index.tsx',
  'index.ts',
  'index.jsx',
  'index.js'
];

// 配置文件获取顺序
export const DEFAULT_CONFIG_FILE = [
  'wb.config.ts',
  'wb.config.js',
  '.wbrc.ts',
  '.wbrc.js'
];

// 默认的编译格式
export const DEFAULT_FORMATS = 'esm,cjs';
