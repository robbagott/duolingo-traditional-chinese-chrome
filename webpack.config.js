const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: [
    path.resolve(__dirname, 'src', 'index.js')
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "manifest.json"),
          to: path.resolve(__dirname, "dist")
        }
      ]
    })
  ]
};
