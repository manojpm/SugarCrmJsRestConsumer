/**
 * SugarCrmJsRestConsumer.js
 * https://github.com/adamjakab/SugarCrmJsRestConsumer
 * (c) 2017-2023 Adam Jakab
 * SugarCrmJsRestConsumer may be freely distributed under the MIT license.
 */
(function()
{
    var _ = require("underscore")
        , qs = require("qs")
        , Promise = require("bluebird")
        , axios = require("axios")
        , md5 = require("md5")
        ;

    /**
     * @constructor
     * @param {string} url
     * @param {string} version
     */
    function SugarCrmJsRestConsumer(url, version)
    {
        if(_.isNull(url) || _.isEmpty(url))
        {
            throw new Error("Parameter 'url' must be provided!");
        }

        if(_.isNull(version) || _.isEmpty(version))
        {
            throw new Error("Parameter 'version' must be provided!");
        }

        var crm_url = url;
        var api_version = version;
        var api_url = crm_url + '/service/' + api_version + '/rest.php';
        var session_id = null;
        var authenticated_user = null;

        var xhr_timeout = 5000;
        var xhr_headers = {
            'User-Agent': 'sugarcrm-js-rest-consumer'
        };

        var AXIOS = axios.create({
            method: "post",
            responseType: 'json',
            timeout: xhr_timeout,
            headers: xhr_headers
        });

        /**
         *
         * @param {string} filter
         */
        this.getModules = function(filter)
        {
            return new Promise(function(fulfill, reject)
            {
                if (!_.contains(['default', 'mobile', 'all'], filter)) {
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
         * @param {string} username
         * @param {string} password
         * @return {Promise}
         */
        this.login = function(username, password)
        {
            var self = this;

            return new Promise(function(fulfill, reject)
            {
                if(_.isNull(username) || _.isEmpty(username))
                {
                    throw new Error("Parameter 'username' must be provided!");
                }

                if(_.isNull(password) || _.isEmpty(password))
                {
                    throw new Error("Parameter 'password' must be provided!");
                }

                session_id = null;
                authenticated_user = null;

                var authMethod = 'login';
                var authArgs = {
                    user_auth: {
                        user_name: username,
                        password: md5(password),
                        version: "1"
                    },
                    application: "SugarCRM JS Rest Consumer"
                };

                self.post(authMethod, authArgs)
                    .then(function(response)
                    {
                        if (!_.isUndefined(response["id"]) && !_.isEmpty(response["id"]))
                        {
                            session_id = response["id"];
                        }

                        if (_.isNull(session_id)) {
                            throw new Error("No session id - authentication failed!");
                        }

                        //register current user
                        authenticated_user = self.nameValueListDecompile(response["name_value_list"]);

                        fulfill(response);
                    })
                    .catch(function(error)
                    {
                        return reject(error);
                    })
                ;
            });
        };

        /**
         * Invalidate session on SugarCRM and clear variables
         * @return {Promise}
         */
        this.logout = function()
        {
            var self = this;

            return new Promise(function(fulfill, reject)
            {

                var authMethod = 'logout';
                var authArgs = {session: session_id};

                self.post(authMethod, authArgs)
                    .then(function()
                    {
                        session_id = null;
                        authenticated_user = null;
                        fulfill();
                    })
                    .catch(function(error)
                    {
                        return reject(error);
                    })
                ;
            });
        };

        /**
         * Checks if SugarCRM accepts current session id
         * @return {Promise}
         */
        this.isAuthenticated = function()
        {
            var self = this;

            return new Promise(function(fulfill, reject)
            {

                var authMethod = 'seamless_login';
                var authArgs = {session: session_id};

                self.post(authMethod, authArgs)
                    .then(function(response)
                    {
                        var answer = (parseInt(response) == 1);
                        fulfill(answer);
                    })
                    .catch(function(error)
                    {
                        return reject(error);
                    })
                ;
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
                var axiosAdditionalConfig = {};
                if(_.isObject(config))
                {
                    axiosAdditionalConfig = _.extend(axiosAdditionalConfig, config);
                }

                var post_data = {
                    method: method,
                    input_type: "JSON",
                    response_type: "JSON",
                    rest_data: JSON.stringify(data)
                };

                AXIOS.post(api_url, qs.stringify(post_data), axiosAdditionalConfig)
                    .then(function(response)
                    {
                        if (response.status == 200) {

                            var responseData = {};
                            if(!_.isUndefined(response.data) && !_.isNull(response.data))
                            {
                                responseData = response.data;
                            }

                            /*
                             * This is how sugarCRM sends errors!!!
                             * Do something about this!
                             * Risk of false positives!
                             */
                            if (!_.isUndefined(responseData["number"])
                                && !_.isUndefined(responseData["name"])
                                && !_.isUndefined(responseData["description"])) {
                                if (responseData["number"]) {
                                    throw new Error(responseData["number"]
                                        + " - " + responseData["name"]
                                        + " - " + responseData["description"]
                                    );
                                }
                            }

                            fulfill(responseData);
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


        this.nameValueListCompile = function()
        {

        };


        /**
         *
         * @param {{}} list
         * @return {{}}
         */
        this.nameValueListDecompile = function(list)
        {
            var answer = {};
            _.mapObject(list, function(valueObject, key)
            {
                answer[key] = valueObject["value"];
            });

            return answer;
        };

        /**
         * @return {{}}
         */
        this.getAuthenticatedUser = function()
        {
            return authenticated_user;
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
        define('SugarCrmJsRestConsumer', [], function()
        {
            return SugarCrmJsRestConsumer;
        });
    }

}.call(this));
