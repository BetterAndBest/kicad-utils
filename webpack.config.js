
const path = require('path');

const babelOptions = {
	"presets": [ [ "env", {
		browsers: ["last 2 versions"] 
	} ] ]
};

module.exports = {
	entry: {
		index: ['babel-polyfill', 'whatwg-fetch', './static/js/app.js'],
	},

	output: {
		path: __dirname + "/static/js",
		filename: '[name].bundle.js',
	},

	node: {
		'fs': 'empty',
	},

	devtool: 'source-map',

	resolve: {
		extensions: ['.ts', '.js'],
		modules: [
			path.join(__dirname, "src"),
			"node_modules"
		]
	},

	module: {
		rules: [
			{
				test: /\.ts?$/,
				use: [
					{
						loader: 'babel-loader',
						options: babelOptions,
					},
					{
						loader: 'ts-loader'
					}
				]
			},
			{
				test: /\.js?$/,
				exclude: /node_modules/, 
				use: [
					{
						loader: 'babel-loader',
						options: babelOptions,
					}
				]
			}
		]
	}
};
