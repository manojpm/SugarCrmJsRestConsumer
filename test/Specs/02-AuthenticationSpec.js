define(['underscore', 'SugarCrmJsRestConsumer', 'axios', 'qs'],
    function(_, SugarCrmJsRestConsumer, axios, qs)
    {
        var crm_url = 'http://gsi.crm.mekit.it'
            , crm_rest_version = 'v4_1'
            , username = 'user1'
            , password = 'user1'
            ;

        var sugar = new SugarCrmJsRestConsumer();
        sugar.init(crm_url, crm_rest_version, username, password);


        describe("SugarCrmJsRestConsumer", function()
        {

            it("should authenticate with authenticate method (no sid)", function(done)
            {
                sugar.authenticate()
                    .then(function(sid)
                    {
                        //console.log("SID: " + sid);
                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });

            it("should authenticate with simple post", function(done)
            {
                var authArgs = {
                    user_auth: {
                        "user_name": username,
                        "password": password,
                        "encryption": 'PLAIN'
                    },
                    application: "SugarCRM JS Rest Consumer Test"
                };


                sugar.post('login', authArgs)
                    .then(function(resp)
                    {
                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });


        });
    }
);
