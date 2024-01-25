"use strict";

const axios = require("axios");


/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
  name: "contract",

  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    add: {
      rest: {
        method: "GET",
        path: "/add"
      },
      params: {
        assetId: {
          type: "string",
        },
        partnerId: {
          type: "string",
        },
        direction: {
          type: "string",
        },
        status: {
          type: "string",
        }
      },
      /**
       * adds Contract
       *
       * @param {Object} ctx - the context object
       * @return {Array} the result of the function
       */
      async handler(ctx) {
            ctx.params.contractId = await ctx.call("access.randomString",{});
            const contract = await ctx.call("contract_model.insert",{entity:ctx.params});
            return ctx.params;
      },
    }
  },

  /**
   * Events
   */
  events: {
    
  },

  /**
   * Methods
   */
  methods: {},

  /**
   * Service created lifecycle event handler
   */
  created() {},

  /**
   * Service started lifecycle event handler
   */
  async started() {},

  /**
   * Service stopped lifecycle event handler
   */
  async stopped() {},
};