import path from 'path';
import { mainStory } from 'storyboard';
import webpack from 'webpack';

const pkg = require('../../package.json');

const fProduction = process.env.NODE_ENV === 'production';

mainStory.info('webpack', 'Webpack configuration:', {
  attach: {
    environment: fProduction ? 'PRODUCTION' : 'DEVELOPMENT',
    version: pkg.version,
  },
});

const _entry = file =>
  fProduction ? [file] : ['webpack-hot-middleware/client?reload=true', file];

const _styleLoader = loaderDesc => `style!${loaderDesc}`;

export default {
  // -------------------------------------------------
  // Input (entry point)
  // -------------------------------------------------
  entry: { app: _entry('./src/client/startup.js') },

  // -------------------------------------------------
  // Output
  // -------------------------------------------------
  output: {
    filename: '[name].bundle.js',

    // Where PRODUCTION bundles will be stored
    path: path.resolve(process.cwd(), 'public/assets'),

    publicPath: '/assets/',

    libraryTarget: undefined,
  },

  // -------------------------------------------------
  // Configuration
  // -------------------------------------------------
  devtool: fProduction ? undefined : 'eval',

  resolve: {
    // Add automatically the following extensions to required modules
    extensions: ['', '.jsx', '.js'],
  },

  plugins: (() => {
    const ret = [
      function pluginCompile() {
        this.plugin('compile', () => mainStory.debug('webpack', 'Bundling...'));
      },
      function pluginDone() {
        this.plugin('done', () =>
          mainStory.debug('webpack', 'Finished bundling!')
        );
      },
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          fProduction ? 'production' : 'development'
        ),
      }),
    ];
    if (fProduction) {
      ret.push(
        new webpack.optimize.UglifyJsPlugin({
          compress: { warnings: false },
          sourceMap: false,
        })
      );
    } else {
      ret.push(new webpack.HotModuleReplacementPlugin());
      ret.push(new webpack.NoErrorsPlugin());
    }
    return ret;
  })(),

  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel',
        exclude: path.resolve(process.cwd(), 'node_modules'),
      },
      {
        test: /\.(otf|eot|svg|ttf|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file',
      },
      {
        test: /\.css$/,
        loader: _styleLoader('css'),
      },
      {
        test: /\.sass$/,
        loader: _styleLoader('css!sass?indentedSyntax'),
      },
      {
        test: /\.png$/,
        loader: 'file',
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  },
};
