module.exports = function (config) {
    return config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            '../unittests/tests/*.js',
            '../unittests/tests/**/*.js'
        ],
        exclude: [],
        preprocessors: {
            '../unittests/tests/*.js': ['webpack', 'sourcemap'],
            '../unittests/tests/**/*.js': ['webpack', 'sourcemap'],
            '../src/**/!(*lib)/*.js': ['coverage', 'webpack', 'sourcemap'],
        },
        coverageReporter: {
            type : 'text-summary',
            dir : 'coverage/'
        },
        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        browserNoActivityTimeout: 100000,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome_headless'],
        singleRun: true,
        webpack: require('../webpack.dev'),
        webpackMiddleware: {
            noInfo: 'errors-only'
        },
        customLaunchers: {
            Chrome_headless: {
                base: 'Chrome',
                flags: [
                    '--disable-gpu',
                    '--headless',
                    '--no-sandbox',
                    '--remote-debugging-port=9222'
                ]
            }
        },
        concurrency: Infinity
    });
};

