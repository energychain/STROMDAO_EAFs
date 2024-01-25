"use strict";

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
    process: {
      rest: {
        method: "POST",
        path: "/process"
      },
      params: {
        assetId: {
          type: "string",
        },
        contractId: {
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
        let findContract = await ctx.call("contract_model.find",{query:{contractId:ctx.params.contractId}});
        if(findContract.length == 1) {
            findContract[0].balanced += 1 * ctx.params.energy;
            if(typeof findContract[0].id == 'undefined') findContract[0].id = findContract[0]._id;
            await ctx.call("contract_model.update",findContract[0]); 
        } else {
          // Inconsistent data
          console.error("contract.process: Inconsistent data for contractId: ",ctx.params.contractId);
        }
        return ctx.params;
      }
    },
    add: {
      rest: {
        method: "POST",
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
            ctx.params.contractId = await ctx.call("access.randomString",{length:10});
            const contract = await ctx.call("contract_model.insert",{entity:ctx.params});
            // for the moment we only allow one entry in the MOL
            await ctx.call("meritorder.set",{
              assetId:ctx.params.assetId,
              mol:[ctx.params]
            });
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