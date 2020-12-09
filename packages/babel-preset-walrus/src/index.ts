import { declare } from '@babel/helper-plugin-utils';
import { mergeConfig } from '@walrus/utils';
import { Options, EnvOptions } from './types';

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

export default declare((api, opts: Options = {}) => {
  api.assertVersion(7);

  // console.log(opts);
  // console.log({
  //   ...mergeConfig(defaultEnvConfig, toObject(opts.env)),
  //   debug: opts.debug,
  // });

  return {
    presets: [
      opts.env && [
        require('@babel/preset-env').default,
        {
          ...mergeConfig(defaultEnvConfig, toObject(opts.env)),
          debug: opts.debug,
        }
      ],
      opts.react && [
        require('@babel/preset-react').default,
        toObject(opts.react)
      ],
      opts.typescript && [
        require('@babel/preset-typescript').default,
        {
          allowNamespaces: true,
          ...toObject(opts.typescript)
        }
      ],
    ].filter(Boolean),
    plugins: [
      [
        require('babel-plugin-module-resolver'),
        {
          root: ['.'],
          alias: {
            ...opts.alias
          }
        }
      ],
      [
        require('@babel/plugin-proposal-optional-chaining').default,
        { loose: false },
      ],
      [
        require('@babel/plugin-proposal-nullish-coalescing-operator').default,
        { loose: false },
      ],
      require('@babel/plugin-syntax-top-level-await').default,
      [
        require('@babel/plugin-transform-destructuring').default,
        { loose: false },
      ],
      opts.typescript && [
        require.resolve('babel-plugin-transform-typescript-metadata'),
      ],
      [
        require('@babel/plugin-proposal-decorators').default,
        { legacy: true }
      ],
      [
        require('@babel/plugin-proposal-class-properties').default,
        { loose: true },
      ],
      require('@babel/plugin-proposal-export-default-from').default,
      [
        require('@babel/plugin-proposal-pipeline-operator').default,
        {
          proposal: 'minimal',
        },
      ],
      require('@babel/plugin-proposal-do-expressions').default,
      require('@babel/plugin-proposal-function-bind').default,
      require('@babel/plugin-proposal-logical-assignment-operators').default,
      opts.dynamicImportNode && [
        require.resolve('babel-plugin-dynamic-import-node'),
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
