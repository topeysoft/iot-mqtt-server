var webpackMerge = require('webpack-merge');
var nodeExternals = require('webpack-node-externals');

var commonConfig = require('./webpack.test');

module.exports = webpackMerge(commonConfig, {
  externals: [
    nodeExternals()
  ]
});