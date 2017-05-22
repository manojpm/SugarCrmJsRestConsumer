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
        sugar.init(crm_url, crm_rest_version, username, password);


        describe("SugarCrmJsRestConsumer", function()
        {

            it("should be true", function()
            {
                expect(true).toBeTruthy();
            });


        });
    }
);
