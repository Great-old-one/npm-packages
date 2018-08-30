const path = require('path')
const cleanWebpackPlugin = require("clean-webpack-plugin")
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')


module.exports = {
    entry: {
        index: path.resolve(__dirname,"src")
    },
    output: {
        filename: "[name].js",
        globalObject: "global",
        path: path.resolve(__dirname, "lib"),
        libraryTarget: 'umd',
        libraryExport: 'default',
    },
    mode: "production",
    devtool: "none",
    resolve: {
        extensions: ['.js', '.json'],
        symlinks: false
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: ['babel-loader'],
                exclude: /(node_modules)/
            }
        ]
    },
    plugins: [
        new cleanWebpackPlugin([path.resolve(__dirname, "lib")], {root: path.resolve("./")}),
        new UglifyJsPlugin({
            parallel: true,
            uglifyOptions: {
                compress: {
                    warnings: false
                },
                mangle: true
            },
            sourceMap: true
        })
    ]
}