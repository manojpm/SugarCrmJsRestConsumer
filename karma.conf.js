// Karma configuration
module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // Which plugins to enable
        plugins: [
            "karma-phantomjs-launcher",
            "karma-chrome-launcher",
            "karma-jasmine",
            "karma-requirejs",
            "karma-js-coverage"
        ],

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'requirejs'],


        // list of files / patterns to load in the browser
        files: [
            'node_modules/babel-polyfill/dist/polyfill.min.js',
            'test/karma.boot.js',
            {pattern: 'node_modules/underscore/underscore-min.js', included: false, watched: false},
            {pattern: 'node_modules/bluebird/js/browser/bluebird.min.js', included: false, watched: false},
            {pattern: 'node_modules/axios/dist/axios.min.js', included: false, watched: false},
            {pattern: 'node_modules/qs/dist/qs.js', included: false, watched: false},

            {pattern: 'test/Specs/**/*.js', included: false, watched: true},

            {pattern: 'SugarCrmJsRestConsumer.js', included: false, watched: true}
        ],

        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            /*'SugarCrmJsRestConsumer.js': ['coverage']*/
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'dots'],

        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_ERROR,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        //http://phantomjs.org/api/command-line.html
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS_no_web_security'],//'PhantomJS','Chrome',
        /*browsers: ['PhantomJS'],/*'PhantomJS','Chrome'*/
        customLaunchers: {
            PhantomJS_no_web_security: {
                base: 'PhantomJS',
                flags: ['--web-security=false']
            }
        },

        //browser timeout in ms
        browserNoActivityTimeout: 10 * 1000,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};