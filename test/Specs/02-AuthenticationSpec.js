define(['underscore', 'SugarCrmJsRestConsumer'],
    function(_, SugarCrmJsRestConsumer)
    {
        var crm_url = 'http://gsi.crm.mekit.it'
            , crm_rest_version = 'v4_1'
            , username = 'user1'
            , password = 'user1'
            , session_id = ''
            ;

        var sugar = new SugarCrmJsRestConsumer();


        describe("SugarCrmJsRestConsumer", function()
        {

            it("should be true", function()
            {
                sugar.init(crm_url, crm_rest_version, username, password);
                expect(true).toBeTruthy();
            });




        });
    }
);
