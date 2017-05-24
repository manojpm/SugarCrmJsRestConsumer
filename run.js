/**
 * This is a temporary file do do some testing - it will be removed and substituted by proper test suite soon.
 *
 */

//var Promise = require("bluebird");

var SugarCrmJsRestConsumer = require('./SugarCrmJsRestConsumer')
    , fs = require("fs")
    , _ = require('underscore')
    , crypto = require("crypto")
    ;

var crm_url = 'http://gsi.crm.mekit.it'
    , crm_rest_version = 'v4_1'
    , username = 'user1'
    , password = 'user1'
    , session_id = ''
    ;

console.log("initing...");

var sidfile = "tmp/sid-" + crypto.createHash("md5").update(crm_url + username).digest("hex");

if (fs.existsSync(sidfile)) {
    session_id = fs.readFileSync(sidfile, 'utf8');
    console.log("reusing previous sid: " + session_id);
}


var sugar = new SugarCrmJsRestConsumer();
sugar.init(crm_url, crm_rest_version, username, password);

sugar.login(session_id)
    .then(function()
    {
        console.log("Auth ok.");
        if (_.isEmpty(session_id)) {
            var cfg = sugar.getConfig();
            fs.writeFileSync(sidfile, cfg["session_id"]);
            console.log("Saved sid[" + cfg["session_id"] + "] for next session.");
        }


        //getting list of modules
        sugar.getModules('all')
            .then(function(resp)
            {
                console.log("got modules");
                console.log(resp);

            })
            .catch(function(error)
            {
                console.error(error);
            });


    })
    .catch(function(error)
    {
        console.log(error);
        if (fs.existsSync(sidfile)) {
            fs.unlinkSync(sidfile);
        }
    });

