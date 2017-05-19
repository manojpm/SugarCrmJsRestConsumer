/**
 * Module
 */
var rp = require('request-promise')
    , _ = require('underscore')
    , Promise = require("bluebird");


function SugarCrmJsRestConsumer()
{
    var crm_url = "";
    var api_version = "";
    var api_url = "";
    var username = "";
    var password = "";
    var session_id = "";

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
    };

    /**
     * @return {Promise}
     */
    this.authenticate = function()
    {
        return new Promise(function(fulfill, reject)
        {
            session_id = "";

            var authArgs = {
                user_auth: {
                    "user_name": username,
                    "password": password,
                    "encryption": 'PLAIN'
                },
                application: "SugarCRM JS Rest Consumer"
            };

            var options = {
                method: "POST",
                uri: api_url,
                form: {
                    method: "login",
                    input_type: "JSON",
                    response_type: "JSON",
                    rest_data: JSON.stringify(authArgs)
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
                        } catch (e) {
                            return reject(new Error("Unable to parse server response!"));
                        }

                        if (!_.isUndefined(response["id"]) && !_.isEmpty(response["id"])) {
                            session_id = response["id"];
                            console.log("SID: " + session_id);
                        }
                    }

                    if (_.isEmpty(session_id)) {
                        return reject(new Error(response["name"] + ' - ' + response["description"]));
                    }

                    fulfill();
                })
                .catch(function(error)
                {
                    return reject(new Error("Request failed with status code: " + error.statusCode));
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
            api_url: api_url,
            crm_url: crm_url,
            api_version: api_version,
            username: username,
            password: password
        }
    };
}

// Export module
module.exports = SugarCrmJsRestConsumer;

