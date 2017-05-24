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

        describe("Application", function()
        {

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
