const path = require('path');
const fs = require('fs');

const rendererOutputPath = path.resolve(__dirname, '../dist/renderer');
fs.mkdirSync(rendererOutputPath, { recursive: true });
fs.copyFileSync(
  path.resolve(__dirname, '../src/renderer/index.html'),
  path.resolve(rendererOutputPath, 'index.html'),
);

const audioSourcePath = path.resolve(__dirname, '../src/assets/audio');
const audioOutputPath = path.resolve(rendererOutputPath, 'audio');
if (fs.existsSync(audioSourcePath)) {
  fs.mkdirSync(audioOutputPath, { recursive: true });
  for (const fileName of fs.readdirSync(audioSourcePath)) {
    if (fileName.toLowerCase().endsWith('.mp3')) {
      fs.copyFileSync(
        path.resolve(audioSourcePath, fileName),
        path.resolve(audioOutputPath, fileName),
      );
    }
  }
}

module.exports = {
  mode: 'development',
  target: 'electron-renderer',
  entry: {
    'app': './src/renderer/app.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.renderer.json'
            }
          }
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: rendererOutputPath,
    clean: false, // Don't clean since we still use tsc for other files
  },
  devtool: 'source-map',
  externals: {
    electron: 'commonjs electron'
  }
};
