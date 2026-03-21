import path from 'path';
import { fileURLToPath } from 'url';
import GasPlugin from 'gas-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  entry: './src/App.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'Code.js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new webpack.BannerPlugin({ 
      banner: 'var global = this;', 
      raw: true, 
      entryOnly: true 
    }),
    new GasPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/**/*.html', to: '[name][ext]' },
        { from: 'appsscript.json', to: '[name][ext]' },
      ],
    }),
  ],
};
