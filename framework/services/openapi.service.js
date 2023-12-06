const OpenApiMixin = require('@spailybot/moleculer-auto-openapi');

module.exports = {
   // Choose your preferred name
   name: 'openapi',
   settings: {
       rest: '/openapi',
       schemaPath: '/openapi/openapi.json',
       openapi: {
         info: {
           title: "zsg-framework",
           version: "0.2.5"
         }
       }
   }
};