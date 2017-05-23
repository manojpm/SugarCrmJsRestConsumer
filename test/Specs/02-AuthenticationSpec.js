define(['underscore', 'SugarCrmJsRestConsumer'],
    function(_, SugarCrmJsRestConsumer)
    {
        var crm_url = 'http://gsi.crm.mekit.it'
            , crm_rest_version = 'v4_1'
            , username = 'user1'
            , password = 'user1'
            , sugar
            ;

        beforeAll(function()
        {
            sugar = new SugarCrmJsRestConsumer();
            sugar.init(crm_url, crm_rest_version, username, password);
        });

        describe("SugarCrmJsRestConsumer authentication", function()
        {

            it("should be cool", function(done)
            {
                //console.log(response);
                //var DL = sugar.nameValueListDecompile(response["name_value_list"]);
                //console.log(DL);
                done();
            });


            it("should return valid response after login with correct session id", function(done)
            {
                sugar.authenticate()
                    .then(function()
                    {
                        var cfg = sugar.getConfig();
                        var sessionId = cfg["session_id"];

                        sugar.authenticate(sessionId)
                            .then(function()
                            {
                                // Check session id
                                cfg = sugar.getConfig();
                                expect(cfg["session_id"]).toBe(sessionId);
                                done();
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            })
                        ;
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });


            it("should return valid response after correct login", function(done)
            {
                sugar.authenticate()
                    .then(function(response)
                    {
                        // Check response
                        expect(_.isObject(response)).toBeTruthy();
                        expect(_.has(response, "id")).toBeTruthy();
                        expect(_.has(response, "module_name")).toBeTruthy();
                        expect(response["module_name"]).toBe("Users");
                        expect(_.has(response, "name_value_list")).toBeTruthy();

                        // Check session id
                        var cfg = sugar.getConfig();
                        expect(cfg["session_id"]).toBe(response["id"]);

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
