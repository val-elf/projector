var path = require('path');
module.exports = {
    resolve: {
		extensions: ['.js', '.json', '.rt', '.less'],
		alias: {
			'projector': path.resolve(__dirname, './app'),
			'api': path.resolve(__dirname, './app/api/models'),
			'common': path.resolve(__dirname, './app/common/components'),
			'components': path.resolve(__dirname, './app/components'),
            'styles': path.resolve(__dirname, './app/common/styles'),
            'contextes': path.resolve(__dirname, './app/contextes'),
			'_localizations': path.resolve(__dirname, '../localization'),
		},
	}
};

