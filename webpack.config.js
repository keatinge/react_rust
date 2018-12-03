module.exports = {
    entry: "./main.js",

    output: {
        path:'/',
        filename: 'index.js',
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',

                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    }
};