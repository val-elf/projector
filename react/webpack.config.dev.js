var path = require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var config = require('./config');
const defaultConfig = require('./webpack.config.common');
process.env.ENV = process.env.NODE_ENV = 'development';

module.exports = Object.assign({}, defaultConfig, {
	devtool: 'cheap-module-source-map',
	entry: [
		'eventsource-polyfill', // necessary for hot reloading with IE
		'webpack-hot-middleware/client',
		'./app/index.ts'
	],
	mode: 'development',
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js',
		publicPath: '/'
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.NoEmitOnErrorsPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('development')
			}
		}),
		new HtmlWebpackPlugin({
			template: 'index.html',
			apiUrl: config.apiUrl
		})
	],
	module: {
		rules: [
			{
				test: /\.rt$/,
				use: [{
					loader: 'react-templates-loader?modules=amd&targetVersion=0.14.0',
			 	}],
				include: path.join(__dirname, 'app'),
			}, {
				test: /\.ts$/,
				use: [{
					loader: 'ts-loader',
				}],
				include: path.join(__dirname, 'app'),
			}, {
				test: /\.js?$/,
				use: [{
					loader: 'babel-loader',
					options: {
						presets: [
							"@babel/react",
						],
						plugins: [
							"@babel/plugin-proposal-class-properties",
							[
								require("babel-plugin-transform-builtin-extend"),
								{
									"globals": [
										"Array"
									]
								}
							]
						]
					}
				}],
				include: path.resolve(__dirname, 'app')
			},
			{
				test: /\.less$/,
				use: [
					{ loader: 'style-loader' },
					{
						loader: 'css-loader',
						options: {
							import: true
						},
					},
					{loader: 'less-loader'},
			]},
			{ test: /\.css$/,
				use: [{ loader: 'style-loader!css-loader' }],
			},
			{ test: /\.(png|jpg)$/,
				use: [{loader: 'url-loader?limit=8192'}]
			} // inline base64 URLs for <=8k images, direct URLs for the rest
		]
	}
});
