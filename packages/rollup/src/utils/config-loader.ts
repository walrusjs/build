import path from 'path'
import joycon from 'joycon';
import { readFileSync } from 'fs-extra';
import requireFromString from 'require-from-string';

const configLoader = new joycon({
  stopDir: path.dirname(process.cwd())
});

configLoader.addLoader({
  test: /\.[jt]s$/,
  loadSync(id) {
    const content = require('@babel/core').transform(
      readFileSync(id, 'utf8'),
      {
        babelrc: false,
        configFile: false,
        filename: id,
        presets: [
          [require('@babel/preset-env'), {
            targets: {
              node: 'current'
            }
          }],
          id.endsWith('.ts') && require('@babel/preset-typescript')
        ].filter(Boolean)
      }
    );

    const result = requireFromString(content && content.code ? content.code : '', id);
    return result.default || result;
  }
});

export default configLoader;
