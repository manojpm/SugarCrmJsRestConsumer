# SugarCrm JS Rest Consumer

[![npm version](https://img.shields.io/npm/v/sugarcrm-js-rest-consumer.svg?style=flat-square)](https://www.npmjs.com/package/sugarcrm-js-rest-consumer)
[![build staus](https://img.shields.io/travis/adamjakab/SugarCrmJsRestConsumer.svg?style=flat-square)](https://travis-ci.org/adamjakab/SugarCrmJsRestConsumer)

Promise based javascript client for SugarCRM Rest API v.4.1 for browser and node.js
 
## Features/Implemented methods
- login
- logout
- seamless_login
- get_user_id
- get_server_info
- get_available_modules
- get_module_fields
- get_entry_list
- get_entries_count
- get_entries
- get_entry
- set_entries
- set_entry
- raw post function to send any method and data to Rest API
 
## Installing

Using npm:

```bash
$ npm install sugarcrm-js-rest-consumer
```

## Examples

### Login

```js
var sugar = new SugarCrmJsRestConsumer(crm_host, "v4_1");
sugar.login("admin", "password")
    .then(function()
    {
        // You are logged in
    })
    .catch(function(error)
    {
        console.error(error);
    });

```

### Create a new record in Contacts module 

```js 
    sugar.setEntry("Contacts", false, {last_name: "Lee", first_name: "Bruce"})
        .then(function(response)
        {
            console.log("SAVED WITH ID: " + response["id"]);
        })
        .catch(function(err)
        {
            console.error(error);
        });
```

## Other
...