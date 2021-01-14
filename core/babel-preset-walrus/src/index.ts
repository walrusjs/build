import { declare } from '@babel/helper-plugin-utils';
import mergeConfig from '@birman/utils/lib/merge-config';
import { Options, EnvOptions, AsyncToPromisesOptions } from '@/types';
import { mapValues } from 'lodash';

const defaultEnvConfig: Partial<EnvOptions> = {
  exclude: [
    'transform-typeof-symbol',
    'transform-unicode-regex',
    'transform-sticky-regex',
    'transform-new-target',
    'transform-modules-umd',
    'transform-modules-systemjs',
    'transform-modules-amd',
    'transform-literals',
  ],
};

function toObject<T extends object>(obj: T | boolean): T | Partial<T> {
  return (typeof obj === 'object' && obj !== null) ? obj : {};
}


export default declare((api: { assertVersion: (version: number) => void }, opts: Options = {}) => {
  api.assertVersion(7);

  const defaulrAsyncToPromisesOptions: Partial<AsyncToPromisesOptions> = {
    inlineHelpers: true,
    externalHelpers: false,
    minify: true,
  }

  return {
    presets: [
      opts.env && [
        require.resolve('@babel/preset-env'),
        {
          ...mergeConfig(defaultEnvConfig, toObject(opts.env)),
          debug: opts.debug,
        }
      ],
      opts.react && [
        require.resolve('@babel/preset-react'),
        toObject(opts.react)
      ],
      opts.typescript && [
        require.resolve('@babel/preset-typescript'),
        {
          allowNamespaces: true,
          ...toObject(opts.typescript)
        }
      ],
    ].filter(Boolean),
    plugins: [
      opts.defines && [
        require.resolve('babel-plugin-transform-replace-expressions'),
        {
          replace: mapValues(opts.defines, function(item) {
            return item + '';
          }),
        }
      ],
      opts.asyncToPromises && [
        require.resolve('babel-plugin-transform-async-to-promises'),
        {
          ...mergeConfig(defaulrAsyncToPromisesOptions, toObject(opts.asyncToPromises)),
        }
      ],
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          root: ['.'],
          alias: {
            ...opts.alias
          }
        }
      ],
      [
        require.resolve('@babel/plugin-proposal-optional-chaining'),
        { loose: false },
      ],
      [
        require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
        { loose: false },
      ],
      require.resolve('@babel/plugin-syntax-top-level-await'),
      [
        require.resolve('@babel/plugin-transform-destructuring'),
        { loose: false },
      ],
      opts.typescript && [
        require.resolve('babel-plugin-transform-typescript-metadata'),
      ],
      [
        require.resolve('@babel/plugin-proposal-decorators'),
        { legacy: true }
      ],
      [
        require.resolve('@babel/plugin-proposal-class-properties'),
        { loose: true },
      ],
      require.resolve('@babel/plugin-syntax-dynamic-import'),
      require.resolve('@babel/plugin-proposal-export-default-from'),
      require.resolve('@babel/plugin-proposal-export-namespace-from'),
      [
        require.resolve('@babel/plugin-proposal-pipeline-operator'),
        {
          proposal: 'minimal',
        },
      ],
      require.resolve('@babel/plugin-proposal-do-expressions'),
      require.resolve('@babel/plugin-proposal-function-bind'),
      require.resolve('@babel/plugin-proposal-logical-assignment-operators'),
      opts.dynamicImportNode && [
        require.resolve('babel-plugin-dynamic-import-node')
      ],
      ...(opts.import
        ? opts.import.map((item) => {
            return [
              require.resolve('babel-plugin-import'),
              item,
              item.libraryName,
            ];
          })
        : []),
    ].filter(Boolean),
  }
});

export * from './types';
