import { Format } from '@walrus/build-types';

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

// 默认的编译格式
export const DEFAULT_FORMATS = 'esm,cjs';

export const ALL_FORMATS: Format[] = ['esm', 'cjs', 'umd'];
