define(['underscore', 'SugarCrmJsRestConsumer'],
    function(_, SugarCrmJsRestConsumer)
    {
        var sugar
            , crm_url = __karma__.config.__TESTVARS__["crm_url"]
            , crm_rest_version = __karma__.config.__TESTVARS__["crm_rest_version"]
            , session_id = ''
            ;

        beforeAll(function()
        {
            sugar = new SugarCrmJsRestConsumer(crm_url, crm_rest_version);
        });

        describe("Initialization", function()
        {

            it("should return correct init variable: crm_url", function()
            {
                var cfg = sugar.getConfig();
                expect(cfg["crm_url"]).toBe(crm_url);
            });

            it("should return correct init variable: api_version", function()
            {
                var cfg = sugar.getConfig();
                expect(cfg["api_version"]).toBe(crm_rest_version);
            });

            it("should return correct init variable: api_url", function()
            {
                var cfg = sugar.getConfig();
                var api_url = crm_url + '/service/' + crm_rest_version + '/rest.php';
                expect(cfg["api_url"]).toBe(api_url);
            });

            it("should return correct init variable: session_id", function()
            {
                var cfg = sugar.getConfig();
                expect(cfg["session_id"]).toBeNull();
            });


        });
    }
);
