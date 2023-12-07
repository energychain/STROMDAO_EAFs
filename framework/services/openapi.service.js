const OpenApiMixin = require('@spailybot/moleculer-auto-openapi');

module.exports = {
   name: 'openapi',
   mixins: [OpenApiMixin],
   settings: {
       rest: 'openapi',
       schemaPath: '/openapi/openapi.json',
       openapi: {
         info: {
           title: "zsg-framework",
           version: "0.2.5"
         }
       }
   },
   async started() {
     console.log("OpenAPI Service started");
    }
};