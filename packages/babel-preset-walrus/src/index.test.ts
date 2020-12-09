import { transform } from '@babel/core';
import { deepmerge, winPath } from '@walrus/utils';
import { Options } from './index';

const DEFAULT_OPTS: Options = {
  react: true,
  env: {
    modules: 'commonjs',
  },
};

function transformWithPreset(code: string, opts: Options) {
  const filename = opts.typescript ? 'file.ts' : 'file.js';
  return transform(code, {
    filename,
    babelrc: false,
    presets: [[require.resolve('./index.ts'), deepmerge(DEFAULT_OPTS, opts)]],
  })!.code;
}

test('cjs', () => {
  const code = transformWithPreset(`import { a } from './a';`, {});
  expect(code).toContain(`var _a = require("./a");`);
});

test('esm', () => {
  const code = transformWithPreset(`import { a } from './a';`, {
    env: {
      modules: false,
    },
  });
  expect(code).toContain(`import { a } from "./a";`);
});

test('typescript', () => {
  const code = transformWithPreset(
    `
  const a: string = 'foo'; console.log(a);
  `,
    {
      typescript: true,
    },
  );
  expect(code).toContain(`var a = 'foo';`);
});

test('typescript with namespace', () => {
  const code = transformWithPreset(
    `
  namespace N {
    export const V = 1;
  }
  `,
    {
      typescript: true,
    },
  );
  expect(code).toContain(`var V = _N.V = 1;`);
});

test('typescript with metadata', () => {
  const code = transformWithPreset(
    `@Decorate
    class MyClass {
      constructor(
        private generic: Generic<A>,
        generic2: Generic<A, B>
      ) {}

      @Run
      method(
        generic: Inter<A>,
        @Arg() generic2: InterGen<A, B>
      ) {}
    }`,
    {
      typescript: true,
    },
  );
  expect(code).toContain('Reflect.metadata');
});

test('typescript with nest-injection', () => {
  const code = transformWithPreset(
    `import { AppService } from './app.service';

    @Controller()
    export class AppController {
      constructor(private appService: AppService) {}

      @Inject()
      appService: AppService;

      @Inject()
      private appService2: AppService;

      @Get()
      getHello(): string {
        return this.appService.getHello();
      }
    }`,
    {
      typescript: true,
    },
  );
  expect(code).toContain('Reflect.metadata');
  expect(code).toContain(
    '_initializerDefineProperty(this, "appService", _descriptor, this);',
  );
  expect(code).toContain(
    '_initializerDefineProperty(this, "appService2", _descriptor2, this);',
  );
});

test('typescript key remapping types', () => {
  const code = transformWithPreset(
    `type Options = {
      [K in "noImplicitAny" | "strictNullChecks" | "strictFunctionTypes"]?: boolean
    };`,
    {
      typescript: true,
    },
  );
  expect(code).toContain('"use strict"');
});

// test('dynamic import', () => {
//   const code = transformWithPreset(`import('./a');`, {});
//   expect(code).toContain(`require('./a')`);
// });

test('alias', () => {
  const code = transformWithPreset(`import { a } from '@/a';`, {
    alias: {
      '@': '../'
    }
  });
  expect(code).toContain(`var _a = require("../a");`);
});

test('object spread', () => {
  const code = transformWithPreset(`const a = { ...b };`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`_objectSpread({}, b);`);
});

test('optional catch binding', () => {
  const code = transformWithPreset(`try { throw e } catch {}`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`catch (_unused) {}`);
});

test('async generator function', () => {
  const code = transformWithPreset(
    `async function* agf() { await 111; yield 222; }`,
    {
      env: {
        targets: { ie: 10 },
      },
    },
  );
  expect(code).toContain(`return _awaitAsyncGenerator(111);`);
});

test('decorators', () => {
  const code = transformWithPreset(`@foo class Foo {}`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`foo(_class = function Foo() {`);
});


test('class properties', () => {
  const code = transformWithPreset(
    `class Foo { a = 'b'; foo = () => this.a; static c = 'd';}`,
    {
      env: {
        targets: { ie: 10 },
      },
    },
  );
  expect(code).toContain(`this.a = 'b';`);
});

test('export default from', () => {
  const code = transformWithPreset(`export v from 'a'`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`Object.defineProperty(exports, "v", {`);
});

test('nullish coalescing operator', () => {
  const code = transformWithPreset(`const a = foo.bar ?? 'hoo';`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`var a = (_foo$bar = foo.bar) !== null &&`);
});

test('optional chaining', () => {
  const code = transformWithPreset(`const a = b?.c?.d;`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`var a = (_b = b) === null || _b`);
});

test('pipeline operator', () => {
  const code = transformWithPreset(`const a = b |> c |> d;`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`var a = (_ref = (_b = b, c(_b)), d(_ref));`);
});

test('do expression', () => {
  const code = transformWithPreset(
    `const a = do { if (foo) 'foo'; else 'bar'; }`,
    {
      env: {
        targets: { ie: 10 },
      },
    },
  );
  expect(code).toContain(`var a = foo ? 'foo' : 'bar';`);
});

test('function bind', () => {
  const code = transformWithPreset(`a::b; ::a.b; a::b(c); ::a.b(c);`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`(_context = a, b).bind(_context);`);
});

test('logical assignment operators', () => {
  const code = transformWithPreset(`a ||= b;`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(winPath(code!)).toContain(`a || (a = b);`);
});

test('top level await', () => {
  const code = transformWithPreset(`await delay(1000);`, {
    env: {
      targets: { ie: 10 },
    },
  });
  expect(code).toContain(`await delay(1000);`);
});
