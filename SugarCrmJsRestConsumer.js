/**
 * SugarCrmJsRestConsumer.js
 * https://github.com/adamjakab/SugarCrmJsRestConsumer
 * (c) 2017-2023 Adam Jakab
 * SugarCrmJsRestConsumer may be freely distributed under the MIT license.
 */
(function()
{
    var  _ = require("underscore")
        , qs = require("qs")
        , Promise = require("bluebird")
        , axios = require("axios")
        ;

    /**
     * @constructor
     */
    function SugarCrmJsRestConsumer()
    {
        var crm_url = "";
        var api_version = "";
        var api_url = "";
        var username = "";
        var password = "";
        var session_id = "";

        var AXIOS;

        var xhr_timeout = 5000;
        var xhr_headers = {
            'User-Agent': 'sugarcrm-js-rest-consumer'
        };


        /**
         *
         * @param {string} url
         * @param {string} version
         * @param {string} user
         * @param {string} pwd
         */
        this.init = function(url, version, user, pwd)
        {
            crm_url = url;
            api_version = version;
            api_url = crm_url + '/service/' + api_version + '/rest.php';
            username = user;
            password = pwd;

            AXIOS = axios.create({
                method: "post",
                responseType: 'json',
                timeout: xhr_timeout,
                headers: xhr_headers
            });
        };

        /**
         *
         * @param {string} filter
         */
        this.getModules = function(filter)
        {
            return new Promise(function(fulfill, reject)
            {
                if(!_.contains(['default', 'mobile', 'all'], filter))
                {
                    return reject(new Error("Unknown filter: " + filter));
                }

                var methodArgs = {
                    session: session_id,
                    filter: filter
                };

                var options = {
                    method: "POST",
                    uri: api_url,
                    form: {
                        method: "get_available_modules",
                        input_type: "JSON",
                        response_type: "JSON",
                        rest_data: JSON.stringify(methodArgs)
                    },
                    headers: {
                        'User-Agent': 'sugarcrm-js-rest-consumer'
                    }
                };

                rp.post(options)
                    .then(function(body)
                    {
                        if (!_.isUndefined(body)) {
                            try {
                                var response = JSON.parse(body);
                                fulfill(response);
                            } catch (e) {
                                return reject(new Error("Unable to parse server response!"));
                            }
                        }
                    })
                    .catch(function(error)
                    {
                        return reject(new Error("Request failed with status code: " + error.statusCode));
                    });
            });
        };

        /**
         * @param {string} [sid]
         * @return {Promise}
         */
        this.authenticate = function(sid)
        {
            var self = this;
            return new Promise(function(fulfill, reject)
            {
                session_id = "";

                if (_.isEmpty(sid))
                {
                    var authArgs = {
                        user_auth: {
                            "user_name": username,
                            "password": password,
                            "encryption": 'PLAIN'
                        },
                        application: "SugarCRM JS Rest Consumer"
                    };

                    self.post('login', authArgs)
                        .then(function(response) {
                            if (!_.isUndefined(response["id"]) && !_.isEmpty(response["id"])) {
                                session_id = response["id"];
                            }
                            if (_.isEmpty(session_id)) {
                                throw new Error("No session id in response!");
                            }
                            fulfill(session_id);
                        })
                        .catch(function(error) {
                            return reject(error);
                        })
                    ;



                    /*
                } else {

                    options = {
                        method: "POST",
                        uri: api_url,
                        form: {
                            method: "seamless_login",
                            input_type: "JSON",
                            response_type: "JSON",
                            rest_data: JSON.stringify({session: sid})
                        },
                        headers: {
                            'User-Agent': 'sugarcrm-js-rest-consumer'
                        }
                    };

                    rp.post(options)
                        .then(function(body)
                        {
                            if (!_.isUndefined(body)) {
                                try {
                                    var response = parseInt(JSON.parse(body));
                                    if(response === 1)
                                    {
                                        session_id = sid;
                                        fulfill();
                                    } else {
                                        return reject(new Error("Invalid Session Id! Please log in again!"));
                                    }
                                } catch (e) {
                                    return reject(new Error("Unable to parse server response!"));
                                }
                            }
                        })
                        .catch(function(error)
                        {
                            return reject(new Error("Request failed with status code: " + error.statusCode));
                        });
                */
                }
            });
        };


        /**
         * @param {string}  method
         * @param {{}}      data
         * @param {{}}      [config]
         *
         * @return {Promise}
         */
        this.post = function(method, data, config)
        {
            return new Promise(function(fulfill, reject)
            {


                var post_data = {
                    method: method,
                    input_type: "JSON",
                    response_type: "JSON",
                    rest_data: JSON.stringify(data)
                };

                AXIOS.post(api_url, qs.stringify(post_data))
                    .then(function(response)
                    {
                        if(response.status == 200)
                        {
                            /*
                             * This is how sugarCRM sends errors!!! Do something about this!
                             * Risk of false positives!
                             */
                            if(!_.isUndefined(response.data["number"])
                                && !_.isUndefined(response.data["name"])
                                && !_.isUndefined(response.data["description"]))
                            {
                                if(response.data["number"]) {
                                    throw new Error(response.data["number"]
                                        + " - " + response.data["name"]
                                        + " - " + response.data["description"]
                                    );
                                }
                            }
                            fulfill(response.data);
                        } else {
                            throw new Error("The request failed with status code " + response.status);
                        }
                    })
                    .catch(function(error)
                    {
                        return reject(error);
                    });
            });
        };

        /**
         *
         * @returns {{api_url: string, crm_url: string, api_version: string, username: string, password: string}}
         */
        this.getConfig = function()
        {
            return {
                crm_url: crm_url,
                api_version: api_version,
                api_url: api_url,
                username: username,
                password: password,
                session_id: session_id
            }
        };

    }

    //----------------------------------------------------------------------------------------------------------------//
    /**
     * Establish the root object, `window` in the browser, or `exports` on the server.
     */
    var root = this;

    /**
     * Export ConfigurationManager for **NodeJs** or add it as global if in browser
     */
    if (typeof module !== 'undefined') {
        module.exports = SugarCrmJsRestConsumer;
    } else {
        root.SugarCrmJsRestConsumer = SugarCrmJsRestConsumer;
    }

    // AMD registration - copied from underscore
    if (typeof define === 'function' && define.amd) {
        define('SugarCrmJsRestConsumer', [], function() {
            return SugarCrmJsRestConsumer;
        });
    }

}.call(this));
