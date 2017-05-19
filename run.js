/**
 * Created by jack on 19/05/17.
 */
//var Promise = require("bluebird");
var SugarCrmJsRestConsumer = require('./SugarCrmJsRestConsumer');

console.log("initing...");
var sugar = new SugarCrmJsRestConsumer();

sugar.init('http://gsi.crm.mekit.it', 'v4_1', 'user1', 'user1');


sugar.authenticate()
    .then(function()
    {
        console.log("Auth ok");

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
        console.error(error);
    });


