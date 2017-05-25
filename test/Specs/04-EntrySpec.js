define(['underscore', 'bluebird', 'SugarCrmJsRestConsumer'],
    function(_, Promise, SugarCrmJsRestConsumer)
    {
        var sugar
            , crm_url = 'http://gsi.crm.mekit.it'
            , crm_rest_version = 'v4_1'
            , username = 'admin'
            , password = 'admin'
            , moduleToTest = 'Users'
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

        describe("Entry", function()
        {


            it("should retrieve filtered records (param: query)", function(done)
            {
                sugar.getEntryList(moduleToTest, {query: 'users.user_name = "admin"'})
                    .then(function(response)
                    {
                        expect(_.isArray(response["entry_list"])).toBeTruthy();
                        expect(_.size(response["entry_list"])).toBe(1);
                        var entry = _.first(response["entry_list"]);
                        expect(_.isObject(entry)).toBeTruthy();
                        expect(entry["user_name"]).toBe("admin");

                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });

            it("should retrieve records with limited fields (param: select_fields)", function(done)
            {
                var selectFields = ["id", "user_name", "full_name"];
                sugar.getEntryList(moduleToTest, {select_fields: selectFields})
                    .then(function(response)
                    {
                        var entry = _.first(response["entry_list"]);
                        var entryFields = _.keys(entry);
                        var fieldDiff = _.difference(entryFields, selectFields);

                        expect(_.size(fieldDiff)).toBe(1);
                        expect(_.first(fieldDiff)).toBe('module_name');
                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });

            it("should retrieve max 1 record (param: max_results)", function(done)
            {
                sugar.getEntryList(moduleToTest, {max_results: 1})
                    .then(function(response)
                    {
                        expect(_.isArray(response["entry_list"])).toBeTruthy();
                        expect(_.size(response["entry_list"])).toBe(1);

                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });

            it("should retrieve list of records (no query)", function(done)
            {
                sugar.getEntryList(moduleToTest)
                    .then(function(response)
                    {
                        expect(_.isObject(response)).toBeTruthy();
                        expect(_.isNumber(response["result_count"])).toBeTruthy();
                        expect(_.isString(response["total_count"])).toBeTruthy();
                        expect(_.isNumber(response["next_offset"])).toBeTruthy();
                        expect(_.isArray(response["entry_list"])).toBeTruthy();
                        expect(_.isArray(response["relationship_list"])).toBeTruthy();

                        var entry = _.first(response["entry_list"]);
                        expect(_.isObject(entry)).toBeTruthy();
                        expect(_.isString(entry["id"])).toBeTruthy();
                        expect(_.isString(entry["module_name"])).toBeTruthy();
                        expect(_.isUndefined(entry["name_value_list"])).toBeTruthy();

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
