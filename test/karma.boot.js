/* Background tests bootstrap*/

//define test spec files to be loaded
var additionalSpecFilter = new RegExp('');
//additionalSpecFilter = new RegExp('/01-');
var specs = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file))
    {
        if (/^\/base\/test\/Specs\/.*Spec\.js$/.test(file))
        {
            if (additionalSpecFilter.test(file))
            {
                specs.push(file);
            }

        }
    }
}

requirejs.config({
    baseUrl: '/base',
    paths: {
        /* MODULES */
        'underscore':     'node_modules/underscore/underscore-min',
        'bluebird':       'node_modules/bluebird/js/browser/bluebird.min',
        'axios':          'node_modules/axios/dist/axios.min',
        'qs':             'node_modules/qs/dist/qs',
        'blueimp-md5':    'node_modules/blueimp-md5/js/md5.min'
    },
    shim: {
        SugarCrmJsRestConsumer: {
            deps: ["underscore", "bluebird", "axios", "qs", "blueimp-md5"]
        }
    },
    deps: []
});


//bootstrap karma with spec files
require([], function() {
    require(specs, function() {
        window.__karma__.start();
    });
});