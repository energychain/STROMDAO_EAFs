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
                mol[0].id = mol[0]._id;
                await ctx.call("meritorder_model.update",mol[0]);
            }
        },
      },
      probeBalance: {
        rest: {
          method: "GET",
          path: "/probeBalance",
        },
        params: {
            assetId: {
                type: "string"
            },
        },
        async handler(ctx) {
            let mol = await ctx.call("meritorder_model.find",{query:{assetId:ctx.params.assetId}});
          
            let transactions = [];
            if(mol.length == 0) {
                return ctx.params;
            } 
            mol = mol[0].mol; // We only allow 1 mol per balancing point

            for(let i=0;i<mol.length;i++) {
              // only allow if all partners are not sealed in balance
              if(
                (await ctx.call("balancing.isSealed",{assetId:mol[i].assetId,epoch:ctx.params.epoch})) ||
                (await ctx.call("balancing.isSealed",{assetId:mol[i].partnerId,epoch:ctx.params.epoch})) ||
                (await ctx.call("balancing.isSealed",{assetId:ctx.params.upstream,epoch:ctx.params.epoch}))                           
              ) {
                continue;
              }

              // TODO Check Status!
              mol[i].load_min *= 1;
              mol[i].load_max *= 1;
              mol[i].energy *= 1;
              mol[i].balanced *= 1;

              let energy_in=0;
              let energy_out=0;
              let co2eq_in=0;
              let co2eq_out=0;

              for(let j=0;j<ctx.params.transactions.length;j++) {
                ctx.params.transactions[j].accounting = "clearing";

                if(ctx.params.transactions[j].from == ctx.params.upstream) {
                  energy_in += 1 * ctx.params.transactions[j].energy;
                  co2eq_in += 1 * ctx.params.transactions[j].co2eq;
                } 
                if(ctx.params.transactions[j].to == ctx.params.upstream) {
                  energy_out += 1 * ctx.params.transactions[j].energy;
                  co2eq_out += 1 * ctx.params.transactions[j].co2eq;
                }
              }

                let transaction = {

                }
                let counterTransaction = {

                }
              
                if(
                  (energy_in > 0) &&
                  (mol[i].direction == "from")
                ) {
                        if(energy_in > mol[i].load_max) {
                          energy_in = mol[i].load_max;
                        }
                        if(energy_in > mol[i].energy) {
                          energy_in = mol[i].energy;
                        } else if(energy_in < mol[i].load_min) {
                          energy_in = 0;
                        }

                        transaction= {
                            "from": mol[i].partnerId,
                            "to": mol[i].assetId,
                            "epoch": ctx.params.epoch,
                            "label": ctx.params.label,
                            "energy": energy_in,
                            "co2eq":co2eq_in,
                            "accounting":"mol",
                            "contractId": mol[i].contractId
                        }
                        counterTransaction = {
                            "from": mol[i].assetId,
                            "to": ctx.params.upstream,
                            "epoch": ctx.params.epoch,
                            "label": ctx.params.label,
                            "energy": energy_in,
                            "co2eq":co2eq_in,
                            "accounting":"mol",
                            "contractId": mol[i].contractId
                        }
                }
                if((energy_out >0) &&
                  (mol[i].direction == "to")
                ) {
                        if(energy_out > mol[i].load_max) {
                          energy_out = mol[i].load_max;
                        }
                        if(energy_out > mol[i].energy) {
                          energy_out = mol[i].energy;
                        } else if(energy_out < mol[i].load_min) {
                          energy_out = 0;
                        }

                        transaction= {
                          "to": mol[i].partnerId,
                          "from": mol[i].assetId,
                          "epoch": ctx.params.epoch,
                          "label": ctx.params.label,
                          "energy": energy_out,
                          "co2eq": co2eq_out,
                          "accounting":"mol",
                          "contractId": mol[i].contractId
                        }
                        counterTransaction = {
                          "to": mol[i].assetId,
                          "from": ctx.params.upstream,
                          "epoch": ctx.params.epoch,
                          "label": ctx.params.label,
                          "energy": energy_out,
                          "co2eq":co2eq_out,
                          "accounting":"mol",
                          "contractId": mol[i].contractId
                      }
                }

                ctx.params.transactions.push(transaction);
                ctx.params.transactions.push(counterTransaction);
              
              // TODO Check Limits of Contract !

              }
            
            return ctx.params;
        },
      },
      process: {
        rest: {
          method: "GET",
          path: "/process",
        },
        params: {
            assetId: {
                type: "string"
            },
        },
        async handler(ctx) {
          let mol = await ctx.call("meritorder_model.find",{query:{assetId:ctx.params.assetId}});
          
          let transactions = [];
          if(mol.length == 0) {
              return ctx.params;
          } 
          mol = mol[0].mol; // We only allow 1 mol per balancing point

          for(let i=0;i<ctx.params.transactions.length;i++) {
              // Identify relevant transactions and change balanced of contract
              if(ctx.params.transactions[i].accounting == 'mol') {
                  await ctx.call("contract.process",ctx.params.transactions[i]);
                  await ctx.call("balance_settlements_active_model.insert",{entity:ctx.params.transactions[i]});
                  // Not handled in MOL!
              }
          }

        }
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