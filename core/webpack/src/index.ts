import Chain from 'webpack-chain';

const chain = new Chain();

chain
  // Interact with entry points
  .entry('index')
    .add('src/index.js')
    .end()
  // Modify output settings
  .output
    .path('dist')
    .filename('[name].bundle.js');

chain.toConfig();
