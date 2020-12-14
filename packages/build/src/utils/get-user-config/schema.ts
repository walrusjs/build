const noEmptyStr = { type: 'string', minLength: 1 };

export default {
  type: 'object',
  additionalProperties: false,
  properties: {
    cwd: { type: 'string' },
    name: { type: 'string' },
    strict: { type: 'boolean' },
    sourcemap: { type: 'boolean' },
    entries: {
      oneOf: [
        { type: 'string' },
        { type: 'array', items: noEmptyStr }
      ]
    },
    format: {
      oneOf: [
        { type: 'string' },
        { type: 'array', items: noEmptyStr }
      ]
    },
    entry: {
      oneOf: [noEmptyStr, { type: 'array', items: noEmptyStr }],
    },
    alias: {
      oneOf: [
        { type: 'object' },
        { type: 'array' }
      ]
    },
    output: { type: 'string' },
    tsconfig: { type: 'string' },
    compress: { type: 'boolean' },
    target: noEmptyStr,
    disableTypeCheck: { type: 'boolean' },
    replaceMode: { type: 'string',  pattern: '^(rollup|babel)$' },
    replace: { type: 'object' }
  },
};
