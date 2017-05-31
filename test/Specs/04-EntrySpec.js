define(['underscore', 'bluebird', 'SugarCrmJsRestConsumer'],
    function(_, Promise, SugarCrmJsRestConsumer)
    {
        var sugar
            , crm_url = __karma__.config.__TESTVARS__["crm_url"]
            , crm_rest_version = __karma__.config.__TESTVARS__["crm_rest_version"]
            , username = __karma__.config.__TESTVARS__["crm_username"]
            , password = __karma__.config.__TESTVARS__["crm_password"]
            , moduleToTest = 'Contacts'
            , timeout_ms = 30 * 1000
            ;

        describe("Entry", function()
        {
            //--------------------------------------------------------------------------------------------------------//
            //-------------------------------------------RETRIEVE(QUERY)----------------------------------------------//
            //--------------------------------------------------------------------------------------------------------//
            it("should retrieve empty answer when no records", function(done)
            {
                sugar.getEntryList(moduleToTest)
                    .then(function(response)
                    {
                        expect(_.isObject(response)).toBeTruthy();
                        expect(parseInt(response["result_count"])).toBe(0);
                        expect(parseInt(response["total_count"])).toBe(0);
                        expect(parseInt(response["next_offset"])).toBe(0);
                        expect(_.isArray(response["entry_list"])).toBeTruthy();
                        expect(_.size(response["entry_list"])).toBe(0);
                        expect(_.isArray(response["relationship_list"])).toBeTruthy();
                        expect(_.size(response["relationship_list"])).toBe(0);
                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });

            it("should retrieve max 1 record (param: max_results)", function(done)
            {
                var numberOfRecords = 3;
                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);

                        sugar.getEntryList(moduleToTest, {max_results: 1})
                            .then(function(response)
                            {
                                expect(_.isObject(response)).toBeTruthy();
                                expect(_.isArray(response["entry_list"])).toBeTruthy();
                                expect(_.size(response["entry_list"])).toBe(1);
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

            it("should retrieve multiple records (no filter)", function(done)
            {
                var numberOfRecords = 3;
                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);

                        sugar.getEntryList(moduleToTest)
                            .then(function(response)
                            {
                                expect(_.isObject(response)).toBeTruthy();
                                expect(parseInt(response["result_count"])).toBe(numberOfRecords);
                                expect(parseInt(response["total_count"])).toBe(numberOfRecords);
                                expect(parseInt(response["next_offset"])).toBe(numberOfRecords);
                                expect(_.isArray(response["entry_list"])).toBeTruthy();
                                expect(_.size(response["entry_list"])).toBe(numberOfRecords);
                                done();
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            });
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });

            it("should retrieve records with limited fields (param: select_fields)", function(done)
            {
                var selectFields = ["id", "first_name", "last_name", "full_name", "phone_work", "phone_mobile"];

                var numberOfRecords = 1;
                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);

                        sugar.getEntryList(moduleToTest, {select_fields: selectFields})
                            .then(function(response)
                            {
                                expect(_.isObject(response)).toBeTruthy();

                                var entry = _.first(response["entry_list"]);
                                var entryFields = _.keys(entry);
                                var fieldDiff = _.difference(entryFields, selectFields);

                                //the only field that is added extra is "module_name" added on each entry by SugarCRM
                                expect(_.size(fieldDiff)).toBe(1);
                                expect(_.first(fieldDiff)).toBe('module_name');

                                _.each(selectFields, function(fieldName){
                                    expect(_.has(entry, fieldName)).toBeTruthy();
                                });

                                done();
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            });
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });

            it("should retrieve filtered records (param: query)", function(done)
            {
                var numberOfRecords = 5;
                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);
                        var randomRecord = _.sample(insertedRecords);
                        var randomFieldName = _.sample(_.keys(randomRecord));

                        sugar.getEntryList(moduleToTest, {query: 'contacts.'+ randomFieldName +' = "' + randomRecord[randomFieldName] + '"'})
                            .then(function(response)
                            {
                                expect(_.isObject(response)).toBeTruthy();
                                expect(_.isArray(response["entry_list"])).toBeTruthy();
                                expect(_.size(response["entry_list"])).toBe(1);
                                var entry = _.first(response["entry_list"]);
                                expect(_.isObject(entry)).toBeTruthy();
                                expect(entry["last_name"]).toBe(randomRecord["last_name"]);
                                expect(entry["first_name"]).toBe(randomRecord["first_name"]);
                                expect(entry["phone_work"]).toBe(randomRecord["phone_work"]);
                                expect(entry["phone_mobile"]).toBe(randomRecord["phone_mobile"]);
                                done();
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            });
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });


            //--------------------------------------------------------------------------------------------------------//
            //---------------------------------------------RETRIEVE(ID)-----------------------------------------------//
            //--------------------------------------------------------------------------------------------------------//
            it("should retrieve records by ID", function(done)
            {
                var numberOfRecords = 7;
                var numberOfRandomRecords = 3;

                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);

                        var randomRecordList = _.sample(insertedRecords, numberOfRandomRecords);
                        var id_list = [];

                        _.map(randomRecordList, function(record)
                        {
                            id_list.push(record["id"]);
                        });

                        sugar.getEntries(moduleToTest, {ids: id_list, select_fields: ["id", "last_name", "first_name"]})
                            .then(function(response)
                            {
                                expect(_.isObject(response)).toBeTruthy();
                                expect(_.isArray(response["entry_list"])).toBeTruthy();
                                expect(_.size(response["entry_list"])).toBe(numberOfRandomRecords);

                                var response_id_list = _.pluck(response["entry_list"], "id");
                                expect(_.size(_.difference(id_list, response_id_list))).toBe(0);
                                expect(_.size(_.difference(response_id_list, id_list))).toBe(0);

                                done();
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            });
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });

            it("should retrieve a single record by id", function(done)
            {
                var numberOfRecords = 3;
                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);
                        var randomRecord = _.sample(insertedRecords);

                        sugar.getEntry(moduleToTest, randomRecord["id"], {select_fields: ["id", "last_name", "first_name"]})
                            .then(function(response)
                            {
                                expect(_.isArray(response["entry_list"])).toBeTruthy();
                                expect(_.size(response["entry_list"])).toBe(1);
                                var entry = _.first(response["entry_list"]);
                                expect(_.isObject(entry)).toBeTruthy();
                                expect(entry["id"]).toBe(randomRecord["id"]);
                                expect(entry["last_name"]).toBe(randomRecord["last_name"]);
                                expect(entry["first_name"]).toBe(randomRecord["first_name"]);
                                done();
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            });
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });


            //--------------------------------------------------------------------------------------------------------//
            //-----------------------------------------------COUNT----------------------------------------------------//
            //--------------------------------------------------------------------------------------------------------//
            it("should get record count (filtered)", function(done)
            {
                var numberOfRecords = 7;
                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);
                        var randomRecord = _.sample(insertedRecords);
                        var randomFieldName = _.sample(_.keys(randomRecord));

                        sugar.getEntriesCount(moduleToTest, {query: 'contacts.'+ randomFieldName +' = "' + randomRecord[randomFieldName] + '"'})
                            .then(function(response)
                            {
                                expect(_.isObject(response)).toBeTruthy();
                                expect(_.isString(response["result_count"])).toBeTruthy();
                                expect(parseInt(response["result_count"])).toBe(1);
                                done();
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            });
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });

            it("should get record count (no filter)", function(done)
            {
                var numberOfRecords = 7;
                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);

                        sugar.getEntriesCount(moduleToTest)
                            .then(function(response)
                            {
                                expect(_.isObject(response)).toBeTruthy();
                                expect(_.isString(response["result_count"])).toBeTruthy();
                                expect(parseInt(response["result_count"])).toBe(numberOfRecords);
                                done();
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            });
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });

            //--------------------------------------------------------------------------------------------------------//
            //-----------------------------------------------CREATE---------------------------------------------------//
            //--------------------------------------------------------------------------------------------------------//
            it("should create a single new record", function(done)
            {
                var recordData = {
                    last_name: "Last-Custom",
                    first_name: "First-Custom",
                    phone_work: "Work-Custom",
                    phone_mobile: "Cell-Custom"
                };
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
                    });
            });

            it("should create multiple new records", function(done)
            {
                var numberOfRecords = 15;

                var i = 0;
                var entry_list = [];
                while (i++ < numberOfRecords) {
                    entry_list.push({
                        last_name: "Last-Custom-" + i,
                        first_name: "First-Custom-" + i,
                        phone_work: "Work-Custom-" + i,
                        phone_mobile: "Cell-Custom-" + i
                    });
                }

                sugar.setEntries(moduleToTest, entry_list)
                    .then(function(response)
                    {
                        expect(_.isObject(response)).toBeTruthy();
                        expect(_.isArray(response["ids"])).toBeTruthy();
                        expect(_.size(response["ids"])).toBe(numberOfRecords);
                        done();
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    })
                ;
            });


            //--------------------------------------------------------------------------------------------------------//
            //-----------------------------------------------MODIFY---------------------------------------------------//
            //--------------------------------------------------------------------------------------------------------//
            it("should modify a single record", function(done)
            {
                var numberOfRecords = 1;
                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);
                        var recordData = _.first(insertedRecords);
                        _.extend(recordData, {
                            last_name: "Last-Custom-Mod-" + _.random(1, 99),
                            first_name: "First-Custom-Mod-" + _.random(1, 99),
                            phone_work: "Work-Custom-Mod-" + _.random(1, 99),
                            phone_mobile: "Cell-Custom-Mod-" + _.random(1, 99)
                        });

                        sugar.setEntry(moduleToTest, false, recordData)
                            .then(function(response)
                            {
                                expect(_.isObject(response)).toBeTruthy();
                                expect(_.isString(response["id"])).toBeTruthy();
                                expect(_.isArray(response["entry_list"])).toBeTruthy();
                                expect(_.size(response["entry_list"])).toBe(1);
                                var entry = _.first(response["entry_list"]);
                                expect(_.isObject(entry)).toBeTruthy();
                                var insertedRecordId = entry["id"];

                                //Confront sent data with received record data
                                _.each(_.keys(recordData), function(k)
                                {
                                    expect(entry[k]).toBe(recordData[k]);
                                });

                                sugar.getEntry(moduleToTest, insertedRecordId)
                                    .then(function(response)
                                    {
                                        expect(_.isArray(response["entry_list"])).toBeTruthy();
                                        expect(_.size(response["entry_list"])).toBe(1);
                                        var entry = _.first(response["entry_list"]);
                                        expect(_.isObject(entry)).toBeTruthy();
                                        expect(entry["id"]).toBe(insertedRecordId);

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
                                    });
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            });
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });

            it("should modify multiple records", function(done)
            {
                var numberOfRecords = 3;
                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);
                        _.each(insertedRecords, function(record) {
                            _.extend(record, {
                                last_name: "Last-Custom-Mod-" + _.random(1, 99),
                                first_name: "First-Custom-Mod-" + _.random(1, 99),
                                phone_work: "Work-Custom-Mod-" + _.random(1, 99),
                                phone_mobile: "Cell-Custom-Mod-" + _.random(1, 99)
                            });
                        });

                        sugar.setEntries(moduleToTest, insertedRecords)
                            .then(function(response)
                            {
                                expect(_.isObject(response)).toBeTruthy();
                                expect(_.isArray(response["ids"])).toBeTruthy();
                                expect(_.size(response["ids"])).toBe(numberOfRecords);

                                var updated_ids = response["ids"];

                                sugar.getEntries(moduleToTest, {ids: updated_ids})
                                    .then(function(response)
                                    {
                                        expect(_.isObject(response)).toBeTruthy();
                                        expect(_.isArray(response["entry_list"])).toBeTruthy();
                                        expect(_.size(response["entry_list"])).toBe(numberOfRecords);

                                        var updatedRecords = response["entry_list"];
                                        var response_id_list = _.pluck(updatedRecords, "id");
                                        expect(_.size(_.difference(updated_ids, response_id_list))).toBe(0);
                                        expect(_.size(_.difference(response_id_list, updated_ids))).toBe(0);

                                        for(var i = 0; i < numberOfRecords; i++) {
                                            var insertedRecord = insertedRecords[i];
                                            var updatedRecord = updatedRecords[i];
                                            _.each(_.keys(insertedRecord), function(k)
                                            {
                                                expect(updatedRecord[k]).toBe(insertedRecord[k]);
                                            });
                                        }

                                        done();
                                    })
                                    .catch(function(err)
                                    {
                                        done.fail(err);
                                    });
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            });
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });


            //--------------------------------------------------------------------------------------------------------//
            //-----------------------------------------------DELETE---------------------------------------------------//
            //--------------------------------------------------------------------------------------------------------//
            it("should delete a single record", function(done)
            {
                var numberOfRecords = 1;
                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);
                        var insertedRecord = _.first(insertedRecords);
                        var id1 = insertedRecord["id"];

                        sugar.deleteEntry(moduleToTest, id1)
                            .then(function(response)
                            {
                                expect(_.isObject(response)).toBeTruthy();
                                expect(_.isString(response["id"])).toBeTruthy();
                                var id2 = response["id"];
                                expect(id1).toBe(id2);

                                sugar.getEntry(moduleToTest, id2, {select_fields: ['id']})
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
                                    });
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            });
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });

            it("should delete multiple records", function(done)
            {
                var numberOfRecords = 7;
                insertRandomRecordsInTestModule(numberOfRecords)
                    .then(function(insertedRecords)
                    {
                        expect(_.size(insertedRecords)).toBe(numberOfRecords);
                        var id_list = _.pluck(insertedRecords, "id");

                        sugar.deleteEntries(moduleToTest, id_list)
                            .then(function(response)
                            {
                                expect(_.isObject(response)).toBeTruthy();
                                expect(_.isArray(response["ids"])).toBeTruthy();
                                expect(_.size(response["ids"])).toBe(numberOfRecords);

                                var deleted_id_list = response["ids"];
                                expect(_.size(_.difference(id_list, deleted_id_list))).toBe(0);
                                expect(_.size(_.difference(deleted_id_list, id_list))).toBe(0);

                                sugar.getEntries(moduleToTest, {ids: id_list, select_fields: ["id"]})
                                    .then(function(response)
                                    {
                                        expect(_.isArray(response["entry_list"])).toBeTruthy();
                                        expect(_.size(response["entry_list"])).toBe(numberOfRecords);
                                        _.each(response["entry_list"], function(entry) {
                                            expect(entry[0]).toBe("Access to this object is denied since it has been deleted or does not exist");
                                        });

                                        done();
                                    })
                                    .catch(function(err)
                                    {
                                        done.fail(err);
                                    });
                            })
                            .catch(function(err)
                            {
                                done.fail(err);
                            });
                    })
                    .catch(function(err)
                    {
                        done.fail(err);
                    });
            });

        });

        /**
         * Insert records in testing module
         *
         * @return {Promise}
         */
        var insertRandomRecordsInTestModule = function(number)
        {
            return new Promise(function(fulfill, reject)
            {
                var i = 0;
                var entry_list = [];
                while (i++ < number) {
                    entry_list.push({
                        last_name: "Last-" + i,
                        first_name: "First-" + i,
                        phone_work: "Work-" + i,
                        phone_mobile: "Cell-" + i
                    });
                }

                sugar.setEntries(moduleToTest, entry_list)
                    .then(function(response)
                    {
                        var ids = response["ids"];
                        var max = _.size(ids);
                        for(var i = 0; i < max; i++) {
                            entry_list[i]["id"] = ids[i];
                        }

                        fulfill(entry_list);
                    })
                    .catch(function(err)
                    {
                        reject(err);
                    });
            });
        };

        /**
         * Delete all records from testing module
         *
         * @return {Promise}
         */
        var emptyTestModule = function()
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
                });
        });

        afterAll(function(done)
        {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout_ms;
            emptyTestModule()
                .then(function()
                {
                    done();
                })
                .catch(function(err)
                {
                    done.fail(err);
                });
        });

        beforeEach(function(done)
        {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = timeout_ms;
            emptyTestModule()
                .then(function()
                {
                    done();
                })
                .catch(function(err)
                {
                    done.fail(err);
                });
        });
    }
);
