const path = require('path');

const getConfig = (file) => ({
  mode: 'production',
  entry: './src/index.js',
  output: {
    filename: file,
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'umd',
    },
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
      },
    ],
  },
});

const client = {
  ...getConfig('main.browser.js'),
  target: 'web',
};

const server = {
  ...getConfig('main.js'),
  target: 'node',
};

module.exports = [client, server];
