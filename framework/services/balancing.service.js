// Service to manage energy balances for assets

// This service provides an API for adding settlements from meters to the energy balancing model.
// It also provides an API for querying balances by asset, epoch, and label.

// The balancing model is a table that stores the energy balance for each asset for each epoch.
// Each balance has the following fields:

// * `assetId`: The ID of the asset that the balance is associated with
// * `epoch`: The epoch that the balance is associated with
// * `in`: The amount of energy that has flowed into the asset
// * `out`: The amount of energy that has flowed out of the asset
// * `created`: The timestamp when the balance was created
// * `updated`: The timestamp when the balance was last updated
// * `label`: A label that can be used to group balances

// The balancing service exposes the following actions:

// * `addSettlement`: Adds a settlement from a meter to the energy balancing model

// The balancing service uses the following Moleculer models:

// * `asset`: The asset model
// * `balancing_model`: The balancing model
// * `statement_model`: The statement model

"use strict";

// Create a new Moleculer service
module.exports = {
  name: "balancing",

  // Define the actions of the service
  actions: {
    // Action to add a settlement from a meter to the energy balancing model
    balance: {
			rest: {
				method: "GET",
				path: "/balance"
			},
      params: {
        assetId: "string",
      },
      async handler(ctx) {
        const EPOCH_DURATION = process.env.EPOCH_DURATION;
        if((typeof ctx.params.epoch == 'undefined')||(ctx.params.epoch == null)) {
          ctx.params.epoch = Math.floor(new Date().getTime() / EPOCH_DURATION);
        } else {
          ctx.params.epoch = 1 * ctx.params.epoch;
        }
        
        let res = await ctx.call("balancing_model.find",{
          query:{
            assetId: ctx.params.assetId,
            epoch:  {$lte: ctx.params.epoch * 1 }
          },
          limit: 24,
          sort: "-epoch"
        });
        let cleaned = {};
        for(let i=0;i<res.length;i++) {
          res[i].time = res[i].epoch * EPOCH_DURATION;
          delete res[i]._id;
          delete res[i].id;
          if(typeof cleaned["epoch_"+res[i].epoch] == 'undefined') {
              cleaned["epoch_"+res[i].epoch] = res[i];
            } else {
              if(res[i].label == '.clearing') {
                cleaned["epoch_"+res[i].epoch] = res[i]; // Clearings always replace other balances
            }
          }
        }
        res = [];
        for (const [key, value] of Object.entries(cleaned)) {
          res.push(value);
        }
        
        return res;
      }
    },
    statements: {
			rest: {
				method: "GET",
				path: "/statements"
			},
      params: {
        assetId: "string",
      },
      async handler(ctx) {
        const EPOCH_DURATION = process.env.EPOCH_DURATION;

        const upstream = await ctx.call("balancing.getUpstream",{ assetId: ctx.params.assetId });

        const query = {
          epoch: 1 * ctx.params.epoch // Might add Label filter here for later use
        };
        if((typeof ctx.params.assetId !== 'undefined') && (ctx.params.assetId != null) && (ctx.params.assetId !== 'null')) {
          query.$or= [
            {from: ctx.params.assetId},
            {to: ctx.params.assetId}
          ];
        }
        if((typeof ctx.params.epoch == 'undefined')||(ctx.params.epoch == null)) {
          ctx.params.epoch = Math.floor(new Date().getTime() / EPOCH_DURATION);
        }

        let res = await ctx.call("statement_model.find",{
          query:query
        });

        // filter cleared elements in res if they are not the targeted assetId.
        let candidates = {};
        let candidates2 = {};
        for(let i=0;i<res.length;i++) {
          delete res[i]._id;
          delete res[i].id;
          res[i].sealed = false;
          res[i].time = res[i].epoch * EPOCH_DURATION;
          let candidate = res[i].to;
          if((res[i].to == upstream) || (res[i].from == upstream)) {
            res[i].isUpstream = true;
          } else {
            res[i].isUpstream = false;
          }
          if(candidate == ctx.params.assetId) candidate = res[i].from;
          if(res[i].label !== '.clearing') {
            if(typeof candidates[candidate] == 'undefined') {
              candidates[candidate] = 0
            }
            candidates[candidate] += res[i].energy;
          }
          if(typeof candidates2[candidate] == 'undefined') {
            candidates2[candidate] = 0
          }
        }
      
      
        // check candidates for closed balances
        for (const [key, value] of Object.entries(candidates2)) {
            let sealedcheck = await ctx.call("balancing_model.find",{
              query:{
                assetId:key,
                sealed:{$exists:true},
                epoch:ctx.params.epoch *1
              }
            });
            if(sealedcheck.length > 0) {
                for(let i=0;i<res.length;i++) {
                  if(res[i].from == key || res[i].to == key) {
                    res[i].sealed = true;
                  } 
                }
            }
        }
        
        // Wird clearing gefiltert, dann verschwinden auch txs, die keine unabhängigen Buchungen haben.

        let cleaned = [];
        for(let i=0;i<res.length;i++) {
          if(res[i].label !== '.clearing') {
            cleaned.push(res[i]);
          } else {
      
            if((typeof candidates[res[i].to] == 'undefined')&&(typeof candidates[res[i].from] == 'undefined')) {
              // In this case we need to invert the statement as it is the only booking 
              const tmp = res[i].from;
              res[i].from = res[i].to;
              res[i].to = tmp;
              res[i].energy *= -1;
              cleaned.push(res[i]);
            }
          }
        }
      
        return res;
      }
    },
    getUpstream: {
      params: {
        assetId: "string"
      },
      async handler(ctx) {
        let upstream = 'eaf_generic_balancegroup';
        const asset = await ctx.call("asset.get", { assetId: ctx.params.assetId,type:"balance" });
        if (asset && asset.balancerule) {
          if(typeof asset.balancerule.from !== 'undefined') {
            upstream = asset.balancerule.from;
          }
          if(typeof asset.balancerule.to !== 'undefined') {
            upstream = asset.balancerule.to;
          }
        }
        return upstream;
      }
    },
    addSettlement: {
      params: {
        meterId: "string",
        epoch: "number",
        consumption: "number",
        label: "string",
      },
      /**
       * Handles the request and performs the necessary operations for balancing the energy exchange or generation from a loadprofile originated settlement of a meter.
       *
       * @param {Object} ctx - The context object containing the request parameters and other context information.
       * @param {string} ctx.params.meterId - The ID of the meter for which the energy exchange needs to be balanced.
       * @param {number} ctx.params.epoch - The epoch at which the energy exchange is being balanced.
       * @param {number} ctx.params.consumption - The amount of energy exchangde to be balanced.
       * @param {string} [ctx.params.label] - The label associated with the energy exchange.
       * @return {Object} The transaction statement 
       */
      async handler(ctx) {
        ctx.params.consumption = Math.round(ctx.params.consumption);
        try {
          // Check if we have a balancing rule for this asset.
          const asset = await ctx.call("asset.get", { assetId: ctx.params.meterId,type:"balance" });
  
          // Initialize the statement and balance objects
          let statement = {
            from: 'eaf_generic_balancegroup',
            to: ctx.params.meterId,
            epoch: ctx.params.epoch,
            energy: ctx.params.consumption,
            label: ctx.params.label,
            counter: 'eaf_generic_balancegroup'          
          };

          // Apply the balancing rule if one exists
         
          if (asset && asset.balancerule) {
            if (asset.balancerule.from) {
              statement.from = asset.balancerule.from;
              statement.counter =  asset.balancerule.from;
            }
            if (asset.balancerule.to) {
              statement.from = ctx.params.meterId; 
              statement.to = asset.balancerule.to;
              statement.counter =  asset.balancerule.to;
            }
          } 

          // validate that we do not have a sealed balances for those assets
          let sealed = false;
          let sealcheck = await ctx.call("balances_sealed_model.find", {
            query: {
              assetId: statement.from,
              epoch: statement.epoch,
              label: statement.label,
              seal: {$exists: true}
            }
          });
          if(sealcheck.length > 0) {
            sealed = true;
          } 
          if(!sealed) {
            sealcheck = await ctx.call("balances_sealed_model.find", {
              query: {
                assetId: statement.to,
                epoch: statement.epoch,
                label: statement.label,
                seal: {$exists: true}
              }
            });
            if(sealcheck.length > 0) {
              sealed = true;
            } 
          }

          // In case balance is already sealed, insert settlement to "late" if not to "open"
          if(sealed) {
            // One of the parties is already sealed
            await ctx.call("balance_settlements_late_model.insert",{entity:statement});
          } else {
            await ctx.call("balance_settlements_active_model.insert",{entity:statement});
          }
        } catch(e) {
          // in case of an exception the settlement needs to be handled manually.
          // Handle manual settlement in case of an exception
          // TODO: Add your manual settlement code here
          console.error(e);
          console.error("Need to handle",ctx.params);
        }
      },
    },
    decodeSeal: {
      params: {
        seal: {type: "string"}
      },
      rest: {
        method: "GET",
        path: "/decodeSeal"
      },
      async handler(ctx) {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.decode(ctx.params.seal);
        return decoded;
      }
    },
    unsealedBalance: {
      params: {
        assetId: { type: "string" },
        epoch: { type: "any" },
        sealed: { type: "any", optional:true }
      },
      rest: {
				method: "GET",
				path: "/unsealedBalance"
			},
      async handler(ctx) {
        let balance = {
          assetId: ctx.params.assetId,
          epoch: ctx.params.epoch,
          in: 0,
          out: 0,
          energy: 0,
          upstream: "",
          upstreamenergy:0,
          clearing: {}
        }

        let settlements = await ctx.call("balance_settlements_active_model.find", {
          query: {
            assetId: ctx.params.assetId,
            epoch: ctx.params.epoch * 1
          },
        });

        balance.upstream = await ctx.call("balancing.getUpstream", {assetId: ctx.params.assetId});

        for(let i=0;i<settlements.length;i++) {
          if(settlements[i].from == ctx.params.assetId) {
            balance.out += settlements[i].energy * 1;
          } else {
            balance.in += settlements[i].energy * 1;
          }
          if(settlements[i].from == balance.upstream) {
            balance.upstreamenergy += settlements[i].energy * 1;
          } else {
            balance.upstreamenergy -= settlements[i].energy * 1;
          }
          balance.energy = balance.out - balance.in;
        }

        return balance;
      }
    },
    sealBalance: {
      params: {
        assetId: { type: "string" },
        epoch: { type: "any" }
      },
      rest: {
				method: "GET",
				path: "/sealBalance"
			},
      async handler(ctx) {
        const jwt = require("jsonwebtoken");

       
        
        return res;
      },
    }
  },
}