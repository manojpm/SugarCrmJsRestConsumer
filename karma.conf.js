// Karma configuration
module.exports = function(config)
{
    var _testvars_ = {
        default: {
            crm_url: "http://localhost",
            crm_rest_version: "v4_1",
            crm_username: "admin",
            crm_password: "admin"
        },
        "travis.local": {
            crm_url: "http://travis.local",
            crm_rest_version: "v4_1",
            crm_username: "admin",
            crm_password: "admin"
        },
        "bradipo.local": {
            crm_url: "http://gsi.crm.mekit.it",
            crm_rest_version: "v4_1",
            crm_username: "admin",
            crm_password: "admin"
        }
    };

    var getTestVariablesByHostname = function()
    {
        var _ = require("underscore");
        var os = require("os");
        var hostname = os.hostname();
        var key = _.has(_testvars_, hostname) ? hostname : 'default';
        return _testvars_[key];
    };

    config.set({

        // Base path to use to resolve all patterns (eg. files, exclude)
        basePath: '',

        // Plugins to enable
        plugins: [
            "karma-phantomjs-launcher",
            "karma-chrome-launcher",
            "karma-jasmine",
            "karma-requirejs",
            "karma-js-coverage"
        ],

        // Frameworks to use - available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'requirejs'],


        // List of files to load in the browser
        files: [
            'test/karma.boot.js',
            'node_modules/babel-polyfill/dist/polyfill.min.js',
            {pattern: 'node_modules/underscore/underscore-min.js', included: false, watched: false},
            {pattern: 'node_modules/bluebird/js/browser/bluebird.min.js', included: false, watched: false},
            {pattern: 'node_modules/axios/dist/axios.min.js', included: false, watched: false},
            {pattern: 'node_modules/qs/dist/qs.js', included: false, watched: false},
            {pattern: 'node_modules/blueimp-md5/js/md5.min.js', included: false, watched: false},

            {pattern: 'test/Specs/**/*Spec.js', included: false, watched: true},

            {pattern: 'SugarCrmJsRestConsumer.js', included: false, watched: true}
        ],

        // List of files to exclude from loading into browser
        exclude: [],


        // Preprocessors to use - available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'SugarCrmJsRestConsumer.js': ['coverage']
        },


        // Reporters to use - ('dots'|'progress') - available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'dots'],

        // Web server port
        port: 9876,

        // Enable / disable colors in the output (reporters and logs)
        colors: false,

        // Logging level: "config.(LOG_DISABLE|LOG_ERROR|LOG_WARN|LOG_INFO|LOG_DEBUG)"
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
        browserNoActivityTimeout: 60 * 1000,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Variables for client
        client: {
            __TESTVARS__: getTestVariablesByHostname()
        }
    });
};