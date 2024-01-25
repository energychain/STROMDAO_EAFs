"use strict";

const axios = require("axios");


/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
  name: "meritorder",

  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    get: {
      rest: {
        method: "GET",
        path: "/get"
      },
      params: {
        assetId: {
          type: "string",
        },
      },
      /**
       * Retrieves the existing MOL of an asset 
       *
       * @param {Object} ctx - the context object
       * @return {Array} the result of the function
       */
      async handler(ctx) {
            const mol = await ctx.call("meritorder_model.find",{query:{assetId:ctx.params.assetId}});
            if(mol.length !== 1) {
                return [];
            } else {
                return mol[0].mol;
            }
      },
    },
    set: {
        rest: {
          method: "POST",
          path: "/set",
        },
        params: {
            assetId: {
                type: "string"
              },
        },
        async handler(ctx) {
            const mol = await ctx.call("meritorder_model.find",{query:{assetId:ctx.params.assetId}});
            if(mol.length !== 1) {
               await ctx.call("meritorder_model.insert",{entity:{assetId:ctx.params.assetId,mol:ctx.params.mol,updated:new Date().getTime()}});
            } else {
                mol[0].mol = ctx.params.mol;
                mol[0].updated = new Date().getTime();
                await ctx.call("meritorder_model.update",mol[0]);
            }
        },
      },
    settle: {
        rest: {
          method: "GET",
          path: "/settle",
        },
        params: {
            assetId: {
                type: "string"
            },
        },
        async handler(ctx) {
            const mol = await ctx.call("meritorder_model.find",{query:{assetId:ctx.params.assetId}});
            let transactions = [];
            if(mol.length !== 1) {
                // traverse the mol to get settlements and add to balance if needed
            } 
            return transactions;
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