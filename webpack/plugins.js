const path = require("path");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const DeadCodePlugin = require('webpack-deadcode-plugin');
const { DuplicatesPlugin } = require('inspectpack/plugin');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = exports = [
    // new CleanWebpackPlugin(),
    // new CaseSensitivePathsPlugin(),
    // new DeadCodePlugin({
        // exclude: [
            // '**/*.(stories|spec).(ts|tsx)',
            // './node_modules/**'
        //   ],
    // }),
    // new DuplicatesPlugin(),
    // new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
        title: 'Test Typescript',
        template: path.resolve(__dirname, '../src/templates/template.html'),
        filename: 'index.html',
    }),
]