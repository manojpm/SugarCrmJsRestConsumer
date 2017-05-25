define(['underscore', 'bluebird', 'SugarCrmJsRestConsumer'],
    function(_, Promise, SugarCrmJsRestConsumer)
    {
        var sugar
            , crm_url = 'http://gsi.crm.mekit.it'
            , crm_rest_version = 'v4_1'
            , username = 'admin'
            , password = 'admin'
            , moduleToTest = 'Contacts'
            , multiple_operations = 30
            , timeout_ms = multiple_operations * 1000
            ;

        describe("Entry", function()
        {


            it("should create multiple records new record", function(done)
            {
                sugar.setAxiosConfig("timeout", timeout_ms);

                var i = 0;
                var entry_list = [];
                while (i++ < multiple_operations) {
                    entry_list.push({last_name: "Last-" + i, first_name: "First-" + i});
                }

                sugar.setEntries(moduleToTest, entry_list)
                    .then(function(response)
                    {
                        expect(_.isObject(response)).toBeTruthy();
                        expect(_.isArray(response["ids"])).toBeTruthy();
                        expect(_.size(response["ids"])).toBe(multiple_operations);

                        console.log(JSON.stringify(response));

                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });


            it("should delete a record", function(done)
            {
                var recordData = {last_name: "JakabZ", first_name: "Adam"};
                sugar.setEntry(moduleToTest, false, recordData)
                    .then(function(response)
                    {
                        expect(_.isString(response["id"])).toBeTruthy();
                        var id1 = response["id"];

                        sugar.deleteEntry(moduleToTest, id1)
                            .then(function(response)
                            {
                                expect(_.isString(response["id"])).toBeTruthy();
                                var id2 = response["id"];
                                expect(id1).toBe(id2);

                                sugar.getEntry(moduleToTest, id2, {select_fields: ['id', 'deleted']})
                                    .then(function(response)
                                    {
                                        expect(_.isArray(response["entry_list"])).toBeTruthy();
                                        expect(_.size(response["entry_list"])).toBe(1);
                                        var entry = _.first(response["entry_list"]);
                                        expect(entry["id"]).toBe(id2);
                                        expect(entry[0]).toBe("Access to this object is denied since it has been deleted or does not exist");

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
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });


            it("should create a new record", function(done)
            {
                var recordData = {last_name: "Jakab", first_name: "Adam"};
                sugar.setEntry(moduleToTest, false, recordData)
                    .then(function(response)
                    {
                        expect(_.isObject(response)).toBeTruthy();
                        expect(_.isString(response["id"])).toBeTruthy();
                        expect(_.isArray(response["entry_list"])).toBeTruthy();
                        expect(_.size(response["entry_list"])).toBe(1);
                        var entry = _.first(response["entry_list"]);
                        expect(_.isObject(entry)).toBeTruthy();

                        //Confront sent data with received record data
                        _.each(_.keys(recordData), function(k)
                        {
                            expect(entry[k]).toBe(recordData[k]);
                        });

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
                sugar.getEntries(moduleToTest, {ids: [1]})
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

        /**
         * Delete all records from testing module
         * @return {Promise}
         */
        var emptyModuleToTest = function()
        {
            return new Promise(function(fulfill, reject)
            {
                sugar.getEntryList(moduleToTest, {select_fields: ["id"], max_results: 999})
                    .then(function(response)
                    {
                        var entries = response["entry_list"];

                        if (_.size(entries) > 0) {
                            var id_list = [];

                            _.map(entries, function(entry)
                            {
                                id_list.push(entry["id"]);
                            });

                            sugar.deleteEntries(moduleToTest, id_list)
                                .then(function()
                                {
                                    fulfill();
                                })
                                .catch(function(error)
                                {
                                    return reject(error);
                                });
                        } else {
                            fulfill();
                        }
                    })
                    .catch(function(error)
                    {
                        return reject(error);
                    });
            });
        };

        beforeAll(function(done)
        {
            sugar = new SugarCrmJsRestConsumer(crm_url, crm_rest_version);
            sugar.setAxiosConfig("timeout", timeout_ms);
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

        afterAll(function(done)
        {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout_ms;
            emptyModuleToTest()
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

        beforeEach(function(done)
        {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout_ms;
            emptyModuleToTest()
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

    }
);
