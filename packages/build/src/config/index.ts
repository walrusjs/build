import { Config } from '../types';

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: Config = {
  format: ['esm', 'cjs'],
  output: 'dist',
  strict: true,
  sourcemap: true,
  compress: true
}

// 配置文件获取顺序
export const DEFAULT_CONFIG_FILE = [
  'wb.config.ts',
  'wb.config.js',
  '.wbrc.ts',
  '.wbrc.js'
];
