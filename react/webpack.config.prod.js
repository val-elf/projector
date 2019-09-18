var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const defaultConfig = require('./webpack.config.common');
var config = require('./config');

const extractLess = new ExtractTextPlugin({
	filename: "styles.css"
});

process.env.ENV = process.env.NODE_ENV = 'production';

module.exports = Object.assign({}, defaultConfig, {
	devtool: 'source-map',
	entry: [
		'./app/index.js'
	],
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js',
		publicPath: '/dist/'
	},
	plugins: [
		extractLess,
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production')
			}
		}),
		new UglifyJsPlugin({ sourceMap: true }),
		new HtmlWebpackPlugin({
			template: 'index.html',
			apiUrl: config.apiUrl
		})
	],
	module: {
		rules: [
			{test: /\.rt$/, loaders: ['babel-loader','react-templates-loader?modules=amd&targetVersion=0.14.0'], include: path.join(__dirname, 'app')},
			{test: /\.js?$/, loader: 'babel-loader', include: path.join(__dirname, 'app')},
			{
				test: /\.less$/,
				use: extractLess.extract({
					use: [
						// {loader: 'style-loader'},
						{
							loader: 'css-loader',
							options: {
								alias: {
									projector: path.resolve(__dirname, './app')
								},
							},
						},
						{loader: 'less-loader'}
					],
	            // use style-loader in development
	            fallback: "style-loader"
	        })
			},
	        {test: /\.css$/, loader: 'style-loader!css-loader'},
	        {test: /\.scss$/, loader: 'style!css!sass'},
	        {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}, // inline base64 URLs for <=8k images, direct URLs for the rest
        ]
    }
});
