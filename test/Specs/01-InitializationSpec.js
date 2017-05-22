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

            it("should return correct init variable: username", function()
            {
                var cfg = sugar.getConfig();
                expect(cfg["username"]).toBe(username);
            });

            it("should return correct init variable: password", function()
            {
                var cfg = sugar.getConfig();
                expect(cfg["password"]).toBe(password);
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
                expect(cfg["session_id"]).toBe("");
            });


        });
    }
);
