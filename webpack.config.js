const path = require('path');

module.exports = {
  entry: {
    app: './renderer.js',
  },
  output: {
    filename: './[name].js',
    path: path.join(__dirname, '/dist'),
  },
  target: 'electron-renderer',
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: 'style-loader!css-loader!postcss-loader!sass-loader',
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
              mimetype: 'application/font-woff',
            },
          },
        ],
      },
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.node', '.ts', '.tsx', '.js', '.scss', '.css'],
  },
  devtool: 'source-map',
};
