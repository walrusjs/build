import { BabelOptions } from './types';

export const defaultOpts: BabelOptions = {
  cwd: '.',
  target: 'node',
  outDir: 'dist',
  buildDir: 'src',
  watch: false,
  relative: false,
  copyFiles: true,
  copyIgnored: false,
  ignore: [
    '**/fixtures{,/**}',
    '**/__test__{,/**}',
    '**/demos{,/**}',
    '**/*.mdx',
    '**/*.md',
    '**/*.+(test|e2e|spec).+(js|jsx|ts|tsx)'
  ],
  includeDotfiles: true,
  extensions: ['.es6', '.js', '.es', '.jsx', '.mjs', '.ts', '.tsx'],
  keepFileExtension: false,
  outFileExtension: undefined,
  sourceMaps: false,
  verbose: false
};
