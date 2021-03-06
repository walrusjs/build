<h1 align="center">
  @walrus/build
</h1>

<h2 align="center">
  A zero configuration library bundler.
</h2>

项目正在紧张开发中...

**一些约定**

- 配置优先级: 配置文件 >> 命令行参数 >> 默认配置
- 入口文件优先级: 配置 >> package.json source >> 默认
- 入口文件默认会按照以下的顺序进行查找
  - `src/index.tsx` 
  - `src/index.ts`,
  - `src/index.jsx`,
  - `src/index.js`,
  - `index.tsx`,
  - `index.ts`,
  - `index.jsx`,
  - `index.js'` 

**注意**

- 目前仅支持`esm`、 `cjs` `umd`三种格式
- 编译时会自动清空控制台，可通过设置环境变量`NO_CLEAR=true`关闭

## ✨ 特性

- 🚀  快速，默认情况下零配置
- 🌈  基于 rollup 和 babel 的打包功能
- 📦  支持 cjs、esm 和 umd 三种格式的打包
- 🎉  支持 lerna
- 🐚  支持别名设置，默认`@`指向项目`src`目录
- 💅  内置支持 `CSS` `Sass` `Stylus` `Less` `CSS modules`
- 💻  使用 TypeScript 编写，提供类型定义文件

## 🔨 使用

1️⃣ **安装** 运行: `yarn add @walrus/build --dev`

2️⃣ **完善项目信息** your `package.json`:

```js
{
  "name": "foo",                   // your package name
  "source": "src/foo.js",          // your source code
  "main": "dist/foo.js",           // where to generate the CommonJS/Node bundle
  "module": "dist/foo.module.js",  // where to generate the ESM bundle
  "unpkg": "dist/foo.umd.js",      // where to generate the UMD bundle (also aliased as "umd:main")
  "scripts": {
    "build": "wb",        // compiles "source" to "main"/"module"/"unpkg"
    "start": "wb --watch"     // re-build when source files change
  }
}
```

3️⃣ **执行编译** 运行 `npm run build`.

## 配置

项目以以下顺序读取配置文件

- `wb.config.ts`
- `wb.config.js`
- `.wbrc.ts`
- `.wbrc.js`

### Cli Options

```
Usage
	$ microbundle <command> [options]

Options
	-v, --version      Displays current version
	-i, --entry        Entry module(s)
  -o, --output       Directory to place build files into
	-f, --format       Only build specified formats (any of esm,cjs,umd) (default esm,cjs)

Examples
	$ wb --tsconfig tsconfig.build.json
```
