const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const HTMLInlineCSSWebpackPlugin = require('html-inline-css-webpack-plugin')
  .default;

const library = webpack.webpack
  ? {
      library: {
        // type: "module",
        type: 'commonjs',
      },
    }
  : { libraryTarget: 'umd' };

const baseForModules = {
  devtool: false,
  mode: 'development',
  // TODO enable this in future after fix bug with `eval` in webpack
  // experiments: {
  //   outputModule: true,
  // },
  output: {
    path: path.resolve(__dirname, '../client/modules'),
    ...library,
  },
  optimization: {
    minimize: false,
  },
  target: webpack.webpack ? ['web', 'es5'] : 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
};

module.exports = [
  merge(baseForModules, {
    entry: path.join(__dirname, 'modules/logger/index.js'),
    output: {
      filename: 'logger/index.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                plugins: ['@babel/plugin-transform-object-assign'],
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        Symbol:
          '(typeof Symbol !== "undefined" ? Symbol : function (i) { return i; })',
      }),
      new webpack.NormalModuleReplacementPlugin(
        /^tapable\/lib\/SyncBailHook/,
        path.join(__dirname, 'modules/logger/SyncBailHookFake.js')
      ),
    ],
  }),
  merge(baseForModules, {
    entry: path.join(__dirname, 'modules/strip-ansi/index.js'),
    output: {
      filename: 'strip-ansi/index.js',
    },
  }),
  merge(baseForModules, {
    entry: path.join(__dirname, 'modules/sockjs-client/index.js'),
    output: {
      filename: 'sockjs-client/index.js',
      library: 'SockJS',
      libraryTarget: 'umd',
      globalObject: "(typeof self !== 'undefined' ? self : this)",
    },
  }),
  merge(baseForModules, {
    mode: 'production',
    entry: path.join(__dirname,  'live/index.js'),
    output: {
      path: path.resolve('client/live'),
      filename: 'main.js',
      libraryTarget: 'umd',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['babel-loader'],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.html$/,
          use: ['html-loader'],
        },
      ],
    },
    plugins: [
      // embed all js and css inline
      new HtmlWebpackPlugin({
        template: './src/live/index.html',
        filename: `index.html`,
      }),
      new HtmlInlineScriptPlugin(),
      new HTMLInlineCSSWebpackPlugin(),
    ],
  }),
];
