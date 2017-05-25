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

            it("should create a new record", function(done)
            {
                var recordData = {last_name: "Jakab", first_name: "Adam"}
                sugar.setEntry("Contacts", false, recordData)
                    .then(function(response)
                    {
                        expect(_.isObject(response)).toBeTruthy();
                        expect(_.isString(response["id"])).toBeTruthy();
                        expect(_.isArray(response["entry_list"])).toBeTruthy();
                        expect(_.size(response["entry_list"])).toBe(1);
                        var entry = _.first(response["entry_list"]);
                        expect(_.isObject(entry)).toBeTruthy();

                        //Confront sent data with recieved record data
                        _.each(_.keys(recordData), function(k) {
                            expect(entry[k]).toBe(recordData[k]);
                        });

                        console.log(entry);

                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });


            it("should retrieve a single record by id", function(done)
            {
                sugar.getEntry(moduleToTest, '1', {select_fields: ['id', 'user_name', 'full_name']})
                    .then(function(response)
                    {
                        expect(_.isArray(response["entry_list"])).toBeTruthy();
                        expect(_.size(response["entry_list"])).toBe(1);
                        var entry = _.first(response["entry_list"]);
                        expect(_.isObject(entry)).toBeTruthy();
                        expect(entry["id"]).toBe("1");
                        expect(entry["user_name"]).toBe("admin");
                        expect(entry["full_name"]).toBe("Administrator");

                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });

            it("should retrieve filtered records (param: query)", function(done)
            {
                sugar.getEntries(moduleToTest, {ids:[1]})
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

            it("should get record count (param: query)", function(done)
            {
                sugar.getEntriesCount(moduleToTest)
                    .then(function(response)
                    {
                        expect(_.isObject(response)).toBeTruthy();
                        expect(_.isString(response["result_count"])).toBeTruthy();
                        expect(parseInt(response["result_count"])).toBeGreaterThan(0);

                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });


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
