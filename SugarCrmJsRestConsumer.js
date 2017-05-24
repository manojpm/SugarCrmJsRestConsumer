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

        /**
         * Establish self object, `window` in the browser, or `exports` on the server.
         */
        var self = this;

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
         * @param {string} module_name
         * @param {string} [fields]
         * @return {Promise}
         */
        this.getModuleFields = function(module_name, fields)
        {
            return new Promise(function(fulfill, reject)
            {
                if(_.isNull(module_name) || _.isEmpty(module_name))
                {
                    return reject(new Error("Parameter 'module_name' must be provided!"));
                }

                fields = _.isArray(fields) ? fields : null;

                var method = 'get_module_fields';
                var methodArgs = {session: session_id, module_name: module_name, fields: fields};

                self.post(method, methodArgs)
                    .then(function(fields)
                    {
                        fulfill(fields);
                    })
                    .catch(function(error)
                    {
                        return reject(error);
                    })
                ;
            });
        };


        /**
         * @param {string} [filter]
         * @return {Promise}
         */
        this.getAvailableModules = function(filter)
        {
            return new Promise(function(fulfill, reject)
            {
                filter = filter || 'all';
                if (!_.contains(['default', 'mobile', 'all'], filter)) {
                    return reject(new Error("Unknown filter: " + filter));
                }

                var method = 'get_available_modules';
                var methodArgs = {session: session_id, filter: filter};

                self.post(method, methodArgs)
                    .then(function(response)
                    {
                        if(_.isUndefined(response["modules"]) || !_.isArray(response["modules"]))
                        {
                            return reject(new Error("Unable to list modules"));
                        }

                        var modules = {};
                        _.each(response["modules"], function(module)
                        {
                            if(!_.isUndefined(module["module_key"]))
                            {
                                var key = module["module_key"];

                                //fix acls
                                if(!_.isUndefined(module["acls"]))
                                {
                                    var action, access;
                                    var acls = _.clone(module["acls"]);
                                    module["acls"] = {};
                                    _.each(acls, function(acl)
                                    {
                                        action = acl["action"];
                                        access = acl["access"];
                                        module["acls"][action] = access;
                                    });
                                }

                                modules[key] = module;
                            }
                        });

                        fulfill(modules);
                    })
                    .catch(function(error)
                    {
                        return reject(error);
                    })
                ;
            });
        };

        /**
         * @return {Promise}
         */
        this.getServerInfo = function()
        {
            return new Promise(function(fulfill, reject)
            {
                self.post('get_server_info', {})
                    .then(function(response)
                    {
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
         * @param {string} username
         * @param {string} password
         * @return {Promise}
         */
        this.login = function(username, password)
        {
            return new Promise(function(fulfill, reject)
            {
                if(_.isNull(username) || _.isEmpty(username))
                {
                    return reject(new Error("Parameter 'username' must be provided!"));
                }

                if(_.isNull(password) || _.isEmpty(password))
                {
                    return reject(new Error("Parameter 'password' must be provided!"));
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
         * @return {Promise}
         */
        this.getUserId = function()
        {
            return new Promise(function(fulfill, reject)
            {
                self.post('get_user_id', {session: session_id})
                    .then(function(response)
                    {
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
         * Checks if SugarCRM accepts current session id
         * @return {Promise}
         */
        this.isAuthenticated = function()
        {
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
                                        + " - method: " + method
                                        + " - data: " + JSON.stringify(data)
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
         * @returns {{}}
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
     * Export ConfigurationManager for **NodeJs** or add it as global if in browser
     */
    if (typeof module !== 'undefined') {
        module.exports = SugarCrmJsRestConsumer;
    } else {
        self.SugarCrmJsRestConsumer = SugarCrmJsRestConsumer;
    }

    // AMD registration - copied from underscore
    if (typeof define === 'function' && define.amd) {
        define('SugarCrmJsRestConsumer', [], function()
        {
            return SugarCrmJsRestConsumer;
        });
    }

}.call(this));
