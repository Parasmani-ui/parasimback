const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    filename: "bundle.[contenthash].js", // cache-busting
    path: path.resolve(__dirname, "build"), // output folder
    publicPath: "/", // ✅ important for React Router
    clean: true, // cleans build folder before new build
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({})],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      favicon: "./public/favicon.ico", // optional if you have favicon
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.(svg|png|jpeg|jpg|gif)$/i,
        type: "asset/resource", // replaces file-loader
        generator: {
          filename: "assets/[hash][ext][query]",
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  devServer: {
    historyApiFallback: true, // ✅ fixes React Router refresh issue
    port: 3000,
    open: true,
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
