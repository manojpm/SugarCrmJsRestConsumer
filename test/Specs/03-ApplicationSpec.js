define(['underscore', 'SugarCrmJsRestConsumer'],
    function(_, SugarCrmJsRestConsumer)
    {
        var sugar
            , crm_url = 'http://gsi.crm.mekit.it'
            , crm_rest_version = 'v4_1'
            , username = 'user1'
            , password = 'user1'
            ;

        beforeAll(function()
        {
            sugar = new SugarCrmJsRestConsumer(crm_url, crm_rest_version);
        });

        beforeEach(function(done)
        {
            sugar.login(username, password)
                .then(function()
                {
                    done();
                })
                .catch(function(err)
                {
                    done.fail(err);
                })
            ;
        });

        describe("Application", function()
        {

            it("should provide list of available modules", function(done)
            {
                sugar.getAvailableModules()
                    .then(function(modules)
                    {
                        //console.log(modules);
                        expect(_.isObject(modules)).toBeTruthy();
                        expect(_.isArray(_.keys(modules))).toBeTruthy();
                        expect(_.isArray(_.values(modules))).toBeTruthy();

                        _.each(modules, function(module, moduleName)
                        {
                            //console.log(moduleName + ": " + JSON.stringify(module));
                            expect(_.isString(module["module_key"])).toBeTruthy();
                            expect(_.isString(module["module_label"])).toBeTruthy();
                            expect(_.isBoolean(module["favorite_enabled"])).toBeTruthy();
                            expect(_.isObject(module["acls"])).toBeTruthy();

                            //"acls":{"edit":true,"delete":true,"list":true,"view":true,"import":true,"export":true}
                            expect(_.contains(_.keys(module["acls"]), "edit")).toBeTruthy();
                            expect(_.contains(_.keys(module["acls"]), "delete")).toBeTruthy();
                            expect(_.contains(_.keys(module["acls"]), "list")).toBeTruthy();
                            expect(_.contains(_.keys(module["acls"]), "view")).toBeTruthy();
                            expect(_.contains(_.keys(module["acls"]), "import")).toBeTruthy();
                            expect(_.contains(_.keys(module["acls"]), "export")).toBeTruthy();
                        });

                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });

            it("should provide server info", function(done)
            {
                sugar.getServerInfo()
                    .then(function(response)
                    {
                        expect(_.isString(response["flavor"])).toBeTruthy();
                        expect(_.isString(response["version"])).toBeTruthy();
                        expect(_.isString(response["gmt_time"])).toBeTruthy();
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
