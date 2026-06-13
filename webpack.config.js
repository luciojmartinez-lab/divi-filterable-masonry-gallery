const path = require('path');

module.exports = {
	entry: './src/divi5/index.jsx',
	output: {
		filename: 'divi5-builder.js',
		path: path.resolve(__dirname, 'assets'),
		clean: false
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-react',
								{
									runtime: 'classic'
								}
							]
						]
					}
				}
			}
		]
	},
	resolve: {
		extensions: ['.js', '.jsx', '.json']
	},
	externalsType: 'window',
	externals: {
		react: 'React',
		'@wordpress/hooks': ['vendor', 'wp', 'hooks'],
		'@divi/module': ['divi', 'module'],
		'@divi/module-library': ['divi', 'moduleLibrary']
	}
};
