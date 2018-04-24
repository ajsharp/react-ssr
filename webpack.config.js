const path = require('path');

const AssetsPlugin = require('assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const merge = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const StartServerPlugin = require('start-server-webpack-plugin');
const webpack = require('webpack');

const DEV_SERVER_PORT = 3001;
const DEVPATH = `http://localhost:${DEV_SERVER_PORT}/`
const SERVER_PORT = 3000;
const SERVER_SRC = './server/index';
const OUTPUT_DIR = 'dist';

const shared = (env, argv) => {
  const IS_DEV = argv.mode !== 'production';

  return {
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.mjs'],
      modules: ['node_modules'],
      alias: {
      }
    },
    output: {
      path: path.resolve(__dirname, OUTPUT_DIR)
    },
    mode: IS_DEV ? 'development' : 'production',

    performance: {
      hints: IS_DEV ? false : true
    },

    plugins: [
      // clean up the dist folder
      new CleanWebpackPlugin([OUTPUT_DIR])
    ],

    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        }
      ]
    }
  }
};

const serverConfig = (env, argv) => {
  const IS_DEV = argv.mode !== 'production';
  const config = {};

  config.plugins = [
    // new webpack.optimize.LimitChunkCountPlugin({
    //   maxChunks: 1,
    // })
  ]

  if (IS_DEV) {
    config.plugins = [
      ...config.plugins,
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
      new StartServerPlugin({
        name: 'server.js'
      }),
      new webpack.WatchIgnorePlugin(['./assets.json'])
    ]
  }

  return merge(shared(env, argv), {
    target: 'node',
    watch: IS_DEV,
    node: {
      __filename: true,
      __dirname: true,
      console: true,
    },
    entry: [
      'webpack/hot/poll?300',
      SERVER_SRC
    ].filter(x => x),

    devServer: {
      contentBase: './dist',
      hot: true
    },

    output: {
      path: path.join(__dirname, OUTPUT_DIR),
      filename: 'server.js'
    },

    plugins: config.plugins,

    externals: [nodeExternals({
      whitelist: ['webpack/hot/poll?300']
    })]
  })
};

let clientConfig = (env, argv) => {
  let config = {};
  const IS_DEV = argv.mode !== 'production';

  const fileBase = 'static/js/'
  const filename = !IS_DEV ? `${fileBase}bundle.[hash:8].js` : `${fileBase}[name].js`
  const chunkName = !IS_DEV ? `${fileBase}[name].[chunkhash:8].js` : `${fileBase}[name].chunk.js`

  config.plugins = [
    new AssetsPlugin({
      path: path.resolve(__dirname, 'dist'),
      filename: 'assets.json'
    })
  ]

  if (IS_DEV) {
    config.devServer = {
      disableHostCheck: true,
      compress: true,
      // watchContentBase: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      host: 'localhost',
      hot: true,
      port: DEV_SERVER_PORT,
      watchOptions: {
        ignored: /node_modules/
      }
    };
    
    config.plugins = [
      ...config.plugins,
      new webpack.NamedModulesPlugin(),
      new webpack.HotModuleReplacementPlugin()
    ];
  }

  return merge(shared(env, argv), {
    entry: {
      client: './src/index.js'
    },
    plugins: config.plugins,
    devServer: config.devServer,
    output: {
      pathinfo: true,
      publicPath: '/',
      filename: filename,
      chunkFilename: chunkName,
      publicPath: IS_DEV ? DEVPATH : '/',
      devtoolModuleFilenameTemplate: info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    devtool: 'cheap-module-source-map',
    stats: 'errors-only',
    target: 'web',
    node: {
      dgram: 'empty',
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
      child_process: 'empty',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader'
          ]
        },
        {
          test: /\.less$/,
          use: [
            'style-loader',
            'css-loader',
            'less-loader'
          ]
        },
        {
          test: /\.png$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                mimetype: 'image/png'
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          use: [
            'file-loader'
          ]
        }
      ]
    }
  });
};

module.exports = [serverConfig];