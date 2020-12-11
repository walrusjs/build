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

## ✨ 特性

* 🚀  快速，默认情况下零配置
* 📦  基于 rollup 进行打包
* 🐚  支持别名设置，默认`@`指向项目`src`目录
* 💅  内置支持 `CSS` `Sass` `Stylus` `Less` `CSS modules`
* 💻  使用 TypeScript 编写，提供类型定义文件

## 🏗 安装

```sh
// npm
npm install @walrus/build --save --dev

// yarn
yarn add @walrus/build --dev
```

## 🔨 使用

- 创建入口文件

```
// src/index.js
const test = 'Hello World';

export function main() {
  console.log(test);
}
```

- 在`package.json`中添加 scripts

```json
{
  "scripts": {
    "build": "wb"
  }
}
```

- 执行编译命令

切换到项目根目录

```
npm run build
```
