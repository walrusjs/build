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
    banner:  {
      oneOf: [
        {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string'
            },
            version: {
              type: 'string'
            },
            author: {
              oneOf: [
                { type: 'string' },
                { type: 'object' }
              ]
            },
            license: { type: 'string' }
          },
        },
        { type: 'string' },
        { type: 'boolean' }
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
    replace: { type: 'object' },
    typeExtractor: {
      oneOf: [
        { type: 'boolean' },
        { type: 'object' }
      ]
    },
  },
};
