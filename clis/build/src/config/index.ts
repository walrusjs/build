import { Config } from '@walrus/build-types';

// 配置文件获取顺序
export const DEFAULT_CONFIG_FILE = [
  'wb.config.ts',
  'wb.config.js',
  '.wbrc.ts',
  '.wbrc.js'
];

export const DEFAULT_CONFIG: Config = {
  format: ['esm', 'cjs'],
  strict: true,
  sourcemap: true,
  compress: true
}

