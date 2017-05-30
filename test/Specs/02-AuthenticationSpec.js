define(['underscore', 'SugarCrmJsRestConsumer'],
    function(_, SugarCrmJsRestConsumer)
    {
        var sugar
            , crm_url = 'http://gsi.crm.mekit.it'
            , crm_rest_version = 'v4_1'
            , username = 'admin'
            , password = 'admin'
            ;

        beforeAll(function()
        {
            sugar = new SugarCrmJsRestConsumer(crm_url, crm_rest_version);
        });

        describe("Authentication", function()
        {
            it("should not be authenticated after logout", function(done)
            {
                sugar.logout()
                    .then(function()
                    {
                        sugar.isAuthenticated()
                            .then(function(response)
                            {
                                expect(response).toBeFalsy();

                                // Check session id
                                var cfg = sugar.getConfig();
                                expect(cfg["session_id"]).toBeNull();

                                //Check authenticated user
                                var user = sugar.getAuthenticatedUser();
                                expect(user).toBeNull();

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
                    })
                ;
            });

            it("should remain authenticated after correct login", function(done)
            {
                sugar.login(username, password)
                    .then(function()
                    {
                        sugar.isAuthenticated()
                            .then(function(response)
                            {
                                expect(response).toBeTruthy();
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
                    })
                ;
            });

            it("should have same authenticated user id as server", function(done)
            {
                sugar.login(username, password)
                    .then(function()
                    {
                        // Check session id
                        var user = sugar.getAuthenticatedUser();
                        sugar.getUserId()
                            .then(function(user_id)
                            {
                                // Check user id
                                expect(user["user_id"]).toBe(user_id);
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
                    })
                ;
            });

            it("should register authenticated user after correct login", function(done)
            {
                sugar.login(username, password)
                    .then(function()
                    {
                        // Check session id
                        var user = sugar.getAuthenticatedUser();
                        expect(_.isObject(user)).toBeTruthy();
                        expect(_.isString(user["user_id"])).toBeTruthy();
                        expect(_.isString(user["user_name"])).toBeTruthy();
                        expect(_.isString(user["user_language"])).toBeTruthy();
                        expect(_.isBoolean(user["user_is_admin"])).toBeTruthy();
                        expect(_.isString(user["user_default_dateformat"])).toBeTruthy();
                        expect(_.isString(user["user_default_timeformat"])).toBeTruthy();
                        expect(_.isString(user["user_number_seperator"])).toBeTruthy();
                        expect(_.isString(user["user_decimal_seperator"])).toBeTruthy();

                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });

            it("should return valid response after correct login", function(done)
            {
                sugar.login(username, password)
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

            it("should throw error on incorrect login", function(done)
            {
                sugar.login('incorrect-user', 'incorrect-password')
                    .then(function(response)
                    {
                        done.fail(new Error("Bad login success! Bad stuff!" + JSON.stringify(response)));
                    })
                    .catch(function(err)
                    {
                        done();
                    })
                ;
            });

        });
    }
);
