const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// const PATHS = {
//   img: path.join(__dirname, 'src/img'),
//   styles: path.join(__dirname, 'src/styles'),
//   build: path.join(__dirname, 'build')
// }

module.exports = env => {
  return {
    entry: {
      app: './src/index.ts',
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.js',
    },

    devServer: {
      compress: true,
      contentBase: './dist',
      publicPath: '/',
      hot: true,
      port: 8080,
    },

    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.scss$/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
        {
          test: /\.(png|jpg)$/,
          loader: 'file-loader'
        },
        {
          test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader'
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader',
          options: {
            limit: 20000, //inline <= 20kb
            mimetype: 'application/font-woff'
          }
        },
        {
          test: /\.svg(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader',
          options: {
            limit: 10000, //inline <= 10kb
            mimetype: 'image/svg+xml'
          }
        }
      ],
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },

    plugins: [
      new CleanWebpackPlugin(['dist']),
      new HtmlWebpackPlugin({
        template: 'index.template.ejs',
      }),
      new webpack.HotModuleReplacementPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
    ],

    devtool: 'source-map',
    mode: 'development',
  }
}
