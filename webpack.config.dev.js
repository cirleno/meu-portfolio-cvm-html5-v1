const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      // O script vem do proprio template (js/script.js). Nao injetar evita
      // carregar o bundle duas vezes; o dev-server serve o path da memoria.
      inject: false,
    }),
  ],
  devServer: {
    liveReload: true,
    hot: true,
    open: true,
    static: {
      directory: path.resolve(__dirname),
    },
  },
});
