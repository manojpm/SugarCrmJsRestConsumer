# SugarCrm JS Rest Consumer

A promise based javascript rest client for SugarCRM Rest API v.4.1 for the browser and node.js
 
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

## Example

```js
// Log in and create a new record in Contacts module 
var sugar = new SugarCrmJsRestConsumer("http://my.crm.deployment.com", "v4_1");
sugar.login("admin", "password")
    .then(function()
    {
        sugar.setEntry("Contacts", false, {last_name: "Lee", first_name: "Bruce"})
            .then(function(response)
            {
                console.log("SAVED WITH ID: " + response["id"]);
            })
            .catch(function(err)
            {
                console.error(error);
            });
    })
    .catch(function(error)
    {
        console.error(error);
    });

```

## Other
...