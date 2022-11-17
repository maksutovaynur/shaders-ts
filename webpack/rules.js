module.exports = [

    {
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
        type: 'asset/inline',
    },
    {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
    },
    {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        type: 'asset/source',
    },
    {
        test: /\.css$/,
        use: ['style-loader','css-loader']
    },
    {
        test: /\.s[ac]ss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
    },
    {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
            configFile: "webpack/tsconfig.json"
        }
    },
]