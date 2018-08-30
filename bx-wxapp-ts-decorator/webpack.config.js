const path = require('path')
const cleanWebpackPlugin = require("clean-webpack-plugin")
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
module.exports = {
    entry: {
        index: "./src/index.js.ts"
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
        extensions: ['.js', '.json', '.ts',],
        symlinks: false
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: ['babel-loader','ts-loader'],
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