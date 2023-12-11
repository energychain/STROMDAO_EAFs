const Openapi = require("moleculer-auto-openapi");

module.exports = {
   name: 'openapi',
   mixins: [Openapi],
   settings: {
    // all setting optional
    openapi: {
      info: {
        // about project
        description: "Energy Applications Framework designed for the German Electricity Market",
        title: "STROMDAO EAF",
        version: "0.2.9"
      },
      tags: [
        // you tags
        { name: "auth", description: "<a href='https://stromdao.de/'>STROMDAO GmbH</a> <dev@stromdao.com>" },
      ],
      components: {
        // you auth
        /*
        securitySchemes: {
          myBasicAuth: {
            type: 'http',
            scheme: 'basic',
          },
        },
        */
      },
    },
  },
   async started() {
     console.log("OpenAPI Service started");
    }
};