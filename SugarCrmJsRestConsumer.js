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
        if (_.isNull(url) || _.isEmpty(url)) {
            throw new Error("Parameter 'url' must be provided!");
        }

        if (_.isNull(version) || _.isEmpty(version)) {
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

        /**
         * @see https://github.com/mzabriskie/axios#request-config
         */
        var axiosDefaultConfig = {
            method: "post",
            responseType: 'json',
            timeout: 5000,
            headers: {'User-Agent': 'sugarcrm-js-rest-consumer'},
            transformRequest: [],
            transformResponse: [],
            withCredentials: false,
            auth: {username: '', password: ''},
            xsrfCookieName: 'XSRF-TOKEN',
            xsrfHeaderName: 'X-XSRF-TOKEN',
            onUploadProgress: null,
            onDownloadProgress: null,
            maxContentLength: -1,
            maxRedirects: 0,
            proxy: {}
        };

        var AXIOS = axios.create(axiosDefaultConfig);


        /**
         * Delete a single entry in module by ID
         * Proxy method
         *
         * @param {String}      module_name
         * @param {Array}       id_list
         *
         * @return {Promise}
         */
        this.deleteEntries = function(module_name, id_list)
        {
            if(!_.isArray(id_list)){
                throw new Error("Parameter id_list must be an array of IDs!");
            }

            var entry_list = [];

            id_list = _.flatten(id_list);
            _.map(id_list, function(id) {
                entry_list.push({
                    id: id,
                    deleted: true
                });
            });

            return self.setEntries(module_name, entry_list);
        };

        /**
         * Delete a single entry in module by ID
         * Proxy method
         *
         * @param {String}      module_name
         * @param {String}      id
         *
         * @return {Promise}
         */
        this.deleteEntry = function(module_name, id)
        {
            return self.setEntry(module_name, id, {deleted: true});
        };

        /**
         * Create|Update an array of entries in module by ID
         * if ID is set the record with tht ID will be updated
         * if ID is not set a new record will be created
         * @see http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.7/Integration/Web_Services/v1_-_v4.1/Methods/set_entries/
         *
         * WORD OF WARNING: see comments on setEntry()
         *
         * @param {String}          module_name
         * @param {Array}           entry_list
         *
         * @return {Promise}
         */
        this.setEntries = function(module_name, entry_list)
        {
            return new Promise(function(fulfill, reject)
            {
                if (_.isNull(module_name) || _.isEmpty(module_name) || !_.isString(module_name)) {
                    return reject(new Error("Parameter 'module_name' must be provided!"));
                }

                var nameValueList = [];//self.nameValueListCompile(parameters);
                _.each(entry_list, function(entry)
                {
                    nameValueList.push(self.nameValueListCompile(entry));
                });

                var method = 'set_entries';
                var methodParams = {
                    session: session_id,
                    module_name: module_name,
                    name_value_list: nameValueList
                };

                //console.log(JSON.stringify(nameValueList));

                self.post(method, methodParams)
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
         * Create|Update a single entry in module by ID
         * if ID is set the record with that ID will be updated
         * if ID is set to FALSE a new record will be created
         * @see http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.7/Integration/Web_Services/v1_-_v4.1/Methods/set_entry/
         *
         * WORD OF WARNING: Even though it is documented, the usage of '{new_with_id:true}' for creating new records
         * does not work resulting in creating a record (for the first time) with id='' and from then on failing with:
         * 'Duplicate entry '' for key 'PRIMARY'!
         * When creating new records the 'id' must be simply omitted from the name_value_list element.
         *
         * @param {String}          module_name
         * @param {String|Boolean}  id
         * @param {Object}          parameters
         *
         * @return {Promise}
         */
        this.setEntry = function(module_name, id, parameters)
        {
            return new Promise(function(fulfill, reject)
            {
                if (_.isNull(module_name) || _.isEmpty(module_name) || !_.isString(module_name)) {
                    return reject(new Error("Parameter 'module_name' must be provided!"));
                }

                var isNewRecord = false;
                if (_.isBoolean(id) && id === false) {
                    isNewRecord = true;
                } else if (_.isNull(id) || _.isEmpty(id) || !_.isString(id)) {
                    return reject(new Error("Parameter 'id' must be provided!"));
                }

                if (!isNewRecord) {
                    parameters = _.extend({id: id}, parameters);
                }
                var nameValueList = self.nameValueListCompile(parameters);

                var method = 'set_entry';
                var methodParams = {
                    session: session_id,
                    module_name: module_name,
                    name_value_list: nameValueList
                };

                self.post(method, methodParams)
                    .then(function(response)
                    {
                        if (!_.isUndefined(response["entry_list"])) {
                            // entry list fixer expects a different format
                            var nameValueList = response["entry_list"];
                            response["entry_list"] = [{name_value_list: nameValueList}];
                            response = self.fixEntryListInResponse(response);
                        }

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
         * Get a single entry from module by ID
         * @see http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.7/Integration/Web_Services/v1_-_v4.1/Methods/get_entry/
         *
         * @param {String}      module_name
         * @param {String}      id
         * @param {Object}      parameters
         * @param {Array}       [parameters.select_fields]
         * @param {Array}       [parameters.link_name_to_fields_array]
         * @param {Boolean}     [parameters.track_view]
         *
         * @return {Promise}
         */
        this.getEntry = function(module_name, id, parameters)
        {
            return new Promise(function(fulfill, reject)
            {
                if (_.isNull(module_name) || _.isEmpty(module_name) || !_.isString(module_name)) {
                    return reject(new Error("Parameter 'module_name' must be provided!"));
                }
                if (_.isNull(id) || _.isEmpty(id) || !_.isString(id)) {
                    return reject(new Error("Parameter 'id' must be provided!"));
                }

                var method = 'get_entry';
                var methodParams = {
                    session: session_id,
                    module_name: module_name,
                    id: id,
                    select_fields: [],
                    link_name_to_fields_array: [],
                    track_view: false
                };
                methodParams = self.mapObjectProperties(methodParams, parameters);

                self.post(method, methodParams)
                    .then(function(response)
                    {
                        response = self.fixEntryListInResponse(response);
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
         * Get a list of entries from module (using a list of IDs)
         * @see http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.7/Integration/Web_Services/v1_-_v4.1/Methods/get_entries/
         *
         * @param {String}      module_name
         * @param {Object}      parameters
         * @param {Array}       parameters.ids
         * @param {Array}       [parameters.select_fields]
         * @param {Array}       [parameters.link_name_to_fields_array]
         * @param {Boolean}     [parameters.track_view]
         *
         * @return {Promise}
         */
        this.getEntries = function(module_name, parameters)
        {
            return new Promise(function(fulfill, reject)
            {
                if (_.isNull(module_name) || _.isEmpty(module_name)) {
                    return reject(new Error("Parameter 'module_name' must be provided!"));
                }

                var method = 'get_entries';
                var methodParams = {
                    session: session_id,
                    module_name: module_name,
                    ids: [],
                    select_fields: [],
                    link_name_to_fields_array: [],
                    track_view: false
                };
                methodParams = self.mapObjectProperties(methodParams, parameters);

                self.post(method, methodParams)
                    .then(function(response)
                    {
                        response = self.fixEntryListInResponse(response);
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
         * Get a list of entries from module (using sql WHERE for filtering)
         * @see http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.7/Integration/Web_Services/v1_-_v4.1/Methods/get_entries_count/
         *
         * @param {String}      module_name
         * @param {Object}      [parameters]
         * @param {String}      [parameters.query]
         * @param {Boolean}     [parameters.deleted]
         *
         * @return {Promise}
         */
        this.getEntriesCount = function(module_name, parameters)
        {
            return new Promise(function(fulfill, reject)
            {
                if (_.isNull(module_name) || _.isEmpty(module_name)) {
                    return reject(new Error("Parameter 'module_name' must be provided!"));
                }

                var method = 'get_entries_count';
                var methodParams = {
                    session: session_id,
                    module_name: module_name,
                    query: '',
                    deleted: false,
                };
                methodParams = self.mapObjectProperties(methodParams, parameters);

                self.post(method, methodParams)
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
         * Get a list of entries from module (using sql WHERE for filtering)
         * @see http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.7/Integration/Web_Services/v1_-_v4.1/Methods/get_entry_list/
         *
         * @param {String}      module_name
         * @param {Object}      [parameters]
         * @param {String}      [parameters.query]
         * @param {String}      [parameters.order_by]
         * @param {Integer}     [parameters.offset]
         * @param {Array}       [parameters.select_fields]
         * @param {Array}       [parameters.link_name_to_fields_array]
         * @param {Integer}     [parameters.max_results]
         * @param {Boolean}     [parameters.deleted]
         * @param {Boolean}     [parameters.favorites]
         *
         * @return {Promise}
         */
        this.getEntryList = function(module_name, parameters)
        {
            return new Promise(function(fulfill, reject)
            {
                if (_.isNull(module_name) || _.isEmpty(module_name)) {
                    return reject(new Error("Parameter 'module_name' must be provided!"));
                }

                var method = 'get_entry_list';
                var methodParams = {
                    session: session_id,
                    module_name: module_name,
                    query: '',
                    order_by: '',
                    offset: 0,
                    select_fields: [],
                    link_name_to_fields_array: [],
                    max_results: null,
                    deleted: false,
                    favorites: false
                };
                methodParams = self.mapObjectProperties(methodParams, parameters);

                self.post(method, methodParams)
                    .then(function(response)
                    {
                        response = self.fixEntryListInResponse(response);
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
         * @see http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.7/Integration/Web_Services/v1_-_v4.1/Methods/get_module_fields/
         *
         * @param {String} module_name
         * @param {Array} [fields]
         * @return {Promise}
         */
        this.getModuleFields = function(module_name, fields)
        {
            return new Promise(function(fulfill, reject)
            {
                if (_.isNull(module_name) || _.isEmpty(module_name)) {
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
         * @param {String} [filter]
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
                        if (_.isUndefined(response["modules"]) || !_.isArray(response["modules"])) {
                            return reject(new Error("Unable to list modules"));
                        }

                        var modules = {};
                        _.each(response["modules"], function(module)
                        {
                            if (!_.isUndefined(module["module_key"])) {
                                var key = module["module_key"];

                                //fix acls
                                if (!_.isUndefined(module["acls"])) {
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
         * @see http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.7/Integration/Web_Services/v1_-_v4.1/Methods/login/
         *
         * @param {String} username
         * @param {String} password
         * @return {Promise}
         */
        this.login = function(username, password)
        {
            return new Promise(function(fulfill, reject)
            {
                if (_.isNull(username) || _.isEmpty(username)) {
                    return reject(new Error("Parameter 'username' must be provided!"));
                }

                if (_.isNull(password) || _.isEmpty(password)) {
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
                        if (!_.isUndefined(response["id"]) && !_.isEmpty(response["id"])) {
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
         * @see http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.7/Integration/Web_Services/v1_-_v4.1/Methods/logout/
         *
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
         * Get ID of currently logged in user
         * @see http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.7/Integration/Web_Services/v1_-_v4.1/Methods/get_user_id/
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
         * @see http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.7/Integration/Web_Services/v1_-_v4.1/Methods/seamless_login/
         *
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
         * Generic Post method
         *
         * @param {String}      method
         * @param {Object}      data
         *
         * @return {Promise}
         */
        this.post = function(method, data)
        {
            return new Promise(function(fulfill, reject)
            {
                var post_data = {
                    method: method,
                    input_type: "JSON",
                    response_type: "JSON",
                    rest_data: JSON.stringify(data)
                };

                AXIOS.post(api_url, qs.stringify(post_data), axiosDefaultConfig)
                    .then(function(response)
                    {
                        if (response.status == 200) {

                            var responseData = {};
                            if (!_.isUndefined(response.data) && !_.isNull(response.data)) {
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

        /**
         * @param {String} key
         * @param {*} value
         */
        this.setAxiosConfig = function(key, value)
        {
            if (_.has(axiosDefaultConfig, key)) {
                axiosDefaultConfig[key] = value;
            } else {
                throw new Error("Invalid key: " + key);
            }
        };

        //------------------------------------------------------------------------------------------------------------//
        /**
         * @todo: move out to some helper class
         * Loop through entries and explode name_value_list out into the entry object
         *
         * @param {Object} response
         * @return {Object}
         */
        this.fixEntryListInResponse = function(response)
        {
            if (_.isArray(response["entry_list"])) {
                var entries = response["entry_list"];
                _.each(entries, function(entry)
                {
                    if (_.isObject(entry["name_value_list"])) {
                        var entryData = self.nameValueListDecompile(entry["name_value_list"]);
                        entry = _.extend(entry, entryData);
                        delete entry["name_value_list"];
                    }
                });
            }
            return response;
        };

        /**
         * @todo: move out to some helper class
         *
         * Map(copy) over property values from extension to original
         * only for properties already defined on original
         * Throws error if invalid property is passed in extension! [could make this optional]
         *
         * @param {{}} original
         * @param {{}} extension
         * @return {{}}
         */
        this.mapObjectProperties = function(original, extension)
        {
            if (_.isObject(original) && !_.isEmpty(original) && _.isObject(extension) && !_.isEmpty(extension)) {
                var allowedProps = _.keys(original);
                var extProps = _.keys(extension);
                var invalidProps = _.difference(extProps, allowedProps);
                if (!_.isEmpty(invalidProps)) {
                    throw new Error("Invalid properties detected: " + JSON.stringify(invalidProps));
                }
                _.each(allowedProps, function(prop)
                {
                    if (_.has(extension, prop)) {
                        original[prop] = extension[prop];
                    }
                });
            }
            return original;
        };

        /**
         * @todo: move out to some helper class
         *
         * @param {Object} data
         * @return {Array}
         */
        this.nameValueListCompile = function(data)
        {
            var answer = [];
            _.mapObject(data, function(value, key)
            {
                answer.push({
                    name: key,
                    value: value
                });
            });

            return answer;
        };

        /**
         * @todo: move out to some helper class
         *
         * @param {Object} list
         * @return {Object}
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
