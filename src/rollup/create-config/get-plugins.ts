import { Plugin } from 'rollup';
import { resolve, extname, dirname } from 'path';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import { isTruthy } from '@/utils';
import customBabel from './babel-custom';
import { getSizeInfo } from './compressed-size';
import { Alias, Format, InternalOptions, MinifyOptions } from '@/types';
import { 
  shouldCssModules, 
  cssModulesConfig 
} from './css-modules';

export interface NameCache {
  [key: string]: any
}

interface GetPluginsOptions extends InternalOptions  {
  entry: string;
  defines: any;
  writeMeta: boolean;
  nameCache: NameCache;
  minifyOptions: MinifyOptions;
  moduleAliases: Alias[];
}

function getDeclarationDir({ options, pkg }) {
	const { cwd, output } = options;

	let result = output;

	if (pkg.types || pkg.typings) {
		result = pkg.types || pkg.typings;
		result = resolve(cwd, result);
	}

	result = dirname(result);

	return result;
}

// Extensions to use when resolving modules
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.es6', '.es', '.mjs'];

const getPlugins = (options: GetPluginsOptions): Plugin[]  => {
  const { 
    cwd, 
    compress, 
    defines,
    moduleAliases,
    writeMeta, 
    entry,
    format,  
    pkg,
    nameCache,
    minifyOptions 
  } = options;

  const isModern = format === 'modern';
  const useTypescript = extname(entry) === '.ts' || extname(entry) === '.tsx';

  // 默认支持 @ >> src
  const defaultAliases: Alias[] = [
    {
      find: '@',
      replacement: resolve(cwd, 'src')
    }
  ];

  const plugins = [
    // https://github.com/egoist/rollup-plugin-postcss
    postcss({
      plugins: [
        autoprefixer(),
        compress !== false &&
        cssnano({
          preset: 'default',
        }),
      ].filter(Boolean),
      autoModules: shouldCssModules(options),
      modules: cssModulesConfig(options),
      inject: false,
      extract: !!writeMeta,
    }),
    // https://github.com/rollup/plugins/tree/master/packages/alias
    alias({
      entries: [...defaultAliases, ...moduleAliases],
    }),
    // https://github.com/rollup/plugins/tree/master/packages/node-resolve
    nodeResolve({
      mainFields: ['module', 'jsnext', 'main'],
      browser: options.target !== 'node',
      extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
      preferBuiltins: options.target === 'node',
    }),
    // https://github.com/rollup/plugins/blob/master/packages/commonjs
    commonjs({
      include: /\/node_modules\//,
    }),
    // https://github.com/rollup/plugins/tree/master/packages/json
    json(),
    useTypescript &&
      typescript({
        typescript: require('typescript'),
        cacheRoot: `./node_modules/.cache/.rts2_cache_${format}`,
        useTsconfigDeclarationDir: true,
        tsconfigDefaults: {
          compilerOptions: {
            sourceMap: options.sourcemap,
            declaration: true,
            declarationDir: getDeclarationDir({ options, pkg }),
            jsx: 'preserve',
            jsxFactory:
              // TypeScript fails to resolve Fragments when jsxFactory
              // is set, even when it's the same as the default value.
              options.jsx === 'React.createElement'
                ? undefined
                : options.jsx || 'h',
          },
          files: options.entries,
        },
        tsconfig: options.tsconfig,
        tsconfigOverride: {
          compilerOptions: {
            module: 'ESNext',
            target: 'esnext',
          },
        },
      }),
    isTruthy(defines) &&
      babel({
        babelHelpers: 'bundled',
        babelrc: false,
        compact: false,
        configFile: false,
        include: 'node_modules/**',
        plugins: [
          [
            require.resolve('babel-plugin-transform-replace-expressions'),
            { replace: defines },
          ],
        ],
      }),
    customBabel()({
      babelHelpers: 'bundled',
      extensions: EXTENSIONS,
      exclude: 'node_modules/**',
      // @ts-ignore
      passPerPreset: true, // @see https://babeljs.io/docs/en/options#passperpreset
      custom: {
        defines,
        modern: isModern,
        compress: options.compress !== false,
        targets: options.target === 'node' ? { node: '8' } : undefined,
        pragma: options.jsx || 'h',
        pragmaFrag: options.jsxFragment || 'Fragment',
        typescript: !!useTypescript,
        jsxImportSource: options.jsxImportSource || false,
      },
    }),
    compress !== false && terser({
      compress: Object.assign(
        {
          keep_infinity: true,
          pure_getters: true,
          passes: 10,
        },
        minifyOptions.compress || {},
      ),
      output: {
        wrap_func_args: false,
        comments: false,
      },
      ecma: isModern ? 2019 : 5,
      toplevel: isModern || format === 'cjs' || format === 'es',
      mangle: Object.assign({}, minifyOptions.mangle || {}),
      nameCache,
    }),
  ].filter(Boolean);

  return plugins;
}


export default getPlugins;