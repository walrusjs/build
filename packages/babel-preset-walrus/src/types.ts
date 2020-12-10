interface TargetsObj {
  esmodules: true,
  node: string | number | 'current' | true,
  safari: string | 'tp',
  browsers: string | string[],
  [key: string]: any;
}

export interface EnvOptions {
  targets: string | string[] | Partial<TargetsObj>;
  esmodules: boolean;
  bugfixes: boolean;
  spec: boolean;
  loose: boolean;
  modules: 'amd' | 'umd' | 'systemjs' | 'commonjs' | 'cjs' | 'auto' | false;
  debug: boolean;
  include: (string | RegExp)[];
  exclude: (string | RegExp)[];
  useBuiltIns: 'usage' | 'entry' | false;
  corejs: 2 | 3 | { version: 2 | 3, proposals: boolean };
  forceAllTransforms: boolean;
}

export interface ReactOptions {
  runtime: 'classic' | 'automatic';
  development: boolean;
  throwIfNamespace: boolean;
  importSource: string;
  pragma: string;
  pragmaFrag: string;
  useBuiltIns: boolean;
  useSpread: string;
}

export interface TypeScriptOptions {
  isTSX: boolean;
  jsxPragma: string;
  allExtensions: boolean;
  allowNamespaces: boolean;
  allowDeclareFields: boolean;
  onlyRemoveTypeImports: boolean;
}

export interface ImportPluginOpts {
  libraryName: string;
  libraryDirectory?: string;
  style?: boolean;
  camel2DashComponentName?: boolean;
}

export interface Options {
  /**
   * 是否使用TypeScript
   */
  typescript?: boolean | Partial<TypeScriptOptions>;
  /**
   * 别名设置
   */
  alias?: Record<string, string>;
  /**
   * @babel/preset-env 配置
   */
  env?: Partial<EnvOptions>;
  react?: boolean | Partial<ReactOptions>;
  debug?: boolean;
  dynamicImportNode?: boolean;
  import?: ImportPluginOpts[];
}
