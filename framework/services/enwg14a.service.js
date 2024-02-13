"use strict";

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
  name: "enwg14a",

  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    preQualify: {
      rest: {
        method: "POST",
        path: "/preQualify",
      },
      params: {
        meterId: {
          type: "string",
        }
      },
      timeout: 60000,
      async handler(ctx) {
        if(typeof ctx.params.active == 'undefined') {
          ctx.params.active = true;
        }
        return await ctx.call("asset.upsert", {assetId: ctx.params.meterId, type: "enwg14a", enwg14a:ctx.params});
      },
    },
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