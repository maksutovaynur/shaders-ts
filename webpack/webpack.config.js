const path = require("path");
const plugins = require("./plugins");
const rules = require("./rules");


module.exports = {
    entry: {
        main: path.resolve(__dirname, '../src/app/index.ts'),
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: 'index.js',
    },
    devtool: 'inline-source-map',
    module: {
        rules: rules
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.png'],
    },
    plugins: plugins,
    mode: 'development',
    devServer: {
        historyApiFallback: true,
        static: path.resolve(__dirname, '../dist'),
        open: false,
        compress: false,
        watchFiles: {
            paths: [
                path.resolve(__dirname, "../webpack/*"),
                path.resolve(__dirname, "../src/*"),
            ]
        },
        hot: true,
        port: 8080,
    }
}