const path = require('path');
const desenLoader = require('./desenLoader');

module.exports = {
    mode: 'development', // development || production
    entry: '/Users/enmeen/study/frontEnd/webpack/src/index.js',
    devtool: false,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [{
            test: /\.js$/,

            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env']
                }
            },
            exclude: /node_modules/,
        },],
    },
};