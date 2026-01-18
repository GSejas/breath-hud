const path = require('path');

module.exports = {
  mode: 'development',
  target: 'electron-renderer',
  entry: {
    'app': './src/renderer/app.ts',
    'app-svg': './src/renderer/app-svg.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist/renderer'),
    clean: false, // Don't clean since we still use tsc for other files
  },
  devtool: 'source-map',
  externals: {
    electron: 'commonjs electron'
  }
};