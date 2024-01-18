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
    assets: {
			rest: {
				method: "GET",
				path: "/assets"
			},
			async handler(ctx) {
        let results = [];
				if((typeof ctx.params.q == 'undefined') || (ctx.params.q.length == 0)) {
					results = (await ctx.call("balancing_model.list",{ pageSize: 50,sort:"-epoch"})).rows;
				} else {
					results = await ctx.call("balancing_model.find",{search:ctx.params.q,searchFields:['assetId'],sort:"-epoch",pageSize:50});
				}
        for(let i=0;i<results.length;i++) {
          results[i].time = results[i].epoch * process.env.EPOCH_DURATION;
          delete results[i]._id;
          delete results[i].id;
        }
        results.sort((a,b) => b.time - a.time);
        return results;
			}
		},
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
        for(let i=0;i<res.length;i++) {
         res[i].time = res[i].epoch * EPOCH_DURATION;
         delete res[i]._id;
         delete res[i].id;
        }
        // we might return multiple balances for different labels
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
        for(let i=0;i<res.length;i++) {
          delete res[i]._id;
          delete res[i].id;
          res[i].sealed = false;
          res[i].time = res[i].epoch * EPOCH_DURATION;
          //if(res[i].label == '.clearing') {
            let candidate = res[i].to;
            if(candidate == ctx.params.assetId) candidate = res[i].from;
            if(typeof candidates[candidate] == 'undefined') {
              candidates[candidate] = 0
            }
            candidates[candidate] += res[i].energy;
         // }
        }
      
      
        // check candidates for closed balances
        for (const [key, value] of Object.entries(candidates)) {
            let sealedcheck = await ctx.call("balancing_model.find",{
              query:{
                assetId:key,
                sealed:{$exists:true},
                epoch:ctx.params.epoch *1
              }
            });
            console.log("query",{
              assetId:key,
              sealed:{$exists:true},
              epoch:ctx.params.epoch *1
            });
            if(sealedcheck.length > 0) {
                for(let i=0;i<res.length;i++) {
                  if(res[i].from == key || res[i].to == key) {
                    res[i].sealed = true;
                  } 
                }
            }
        }

        let cleaned = [];
        for(let i=0;i<res.length;i++) {
          if(res[i].label !== '.clearing') {
            cleaned.push(res[i]);
          }
        }
        return cleaned;
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
          if(typeof ctx.params.isClose == 'undefined') {
            ctx.params.isClose = false;
          }
          // Initialize the statement and balance objects
          let statement = {
            from: 'eaf_general',
            to: ctx.params.meterId,
            epoch: ctx.params.epoch,
            energy: ctx.params.consumption,
            label: ctx.params.label,
            counter: 'eaf_general'
          };

          // Apply the balancing rule if one exists

          /*
          // TODO Handle Balancing Rules with changes in future / past 

          Perspective is from asset not from this:
            in = Electricity got consumed by the asset
            out = Electricity got produced by the asset
          */
          if (asset && asset.balancerule) {
            if (asset.balancerule.from) {
              statement.from = asset.balancerule.from;
              statement.counter =  asset.balancerule.from;
            }
            if (asset.balancerule.to) {
              statement.from = ctx.params.meterId; // fix for "Einspeiser"
              statement.to = asset.balancerule.to;
              statement.counter =  asset.balancerule.to;
            }
          } else {
            // If there is no balancing rule, the energy is considered to be consumed locally
        
          }
          let cleared='';
          if(ctx.params.isClose) {
            cleared='_cleared';
          }

          // Find any existing balance for the given asset and counter asset at epoch
          let balance_from = {
            assetId: statement.from,
            epoch: ctx.params.epoch,
            in: 0,
            out: Math.abs(1 * ctx.params.consumption),
            label: ctx.params.label,
            created: new Date().getTime(),
            counter: statement.to
          };

          const balances_from = await ctx.call("balancing_model.find", {
            query: {
              sealed: { "$exists": true },
              epoch: ctx.params.epoch,
              assetId: statement.from
            },
          });


          let balance_to = {
            assetId: statement.to,
            epoch: ctx.params.epoch,
            in: Math.abs(1 * ctx.params.consumption),
            out: 0,
            label: ctx.params.label,
            created: new Date().getTime(),
            counter: statement.from
          };

          const balances_to = await ctx.call("balancing_model.find", {
            query: {
              epoch: ctx.params.epoch,
              assetId: statement.to,
              sealed: { "$exists": true }
            },
          });

          // ensure that we do not have sealed balances
          let sealed = false;
          if ( balances_to.length > 0) {
             sealed = true; 
          }

          if (balances_from.length > 0)  {
              sealed = true; 
          }

          if(!sealed) {
                  // Insert the statement into the database
              if(!ctx.params.isClose) {
                await ctx.call("statement_model.insert", { entity: statement });
                await ctx.broker.emit("transferfrom."+statement.from, ctx.params.consumption);
                await ctx.broker.emit("transferto."+statement.to, ctx.params.consumption);
              }  else {
                // if this is a closing, we need to follow the signed ctx.params.consumption to get direction
                if(ctx.params.consumption < 0) {
                    statement.from = statement.counter;
                    statement.to = ctx.params.meterId;
                    statement.energy = Math.abs(statement.energy) * (-1);
                } else {
                    statement.from = ctx.params.meterId;
                    statement.to = statement.counter;
                    statement.energy = Math.abs(statement.energy) * (-1);
                }
                await ctx.call("statement_model.insert", { entity: statement });
                await ctx.broker.emit("clearedfrom."+statement.from, statement.energy);
                await ctx.broker.emit("clearedto."+statement.to, statement.energy);
                statement.energy *= -1;
              }
              // Update the balance if it exists, otherwise create a new one
              if (balances_from && balances_from.length > 0) {
                balance_from.in += balances_from[0].in;
                balance_from.out += balances_from[0].out;
                balance_from.id = balances_from[0].id;
                balance_from._id = balances_from[0]._id;
                balance_from.updated = new Date().getTime();

                if (typeof balance_from._id == 'undefined') balance_from._id = balance_from.id;
                if (typeof balance_from.id == 'undefined') balance_from.id = balance_from._id;
                await ctx.call("balancing"+cleared+"_model.update", balance_from);
              } else {
                await ctx.call("balancing"+cleared+"_model.insert", { entity: balance_from });
              }
              await ctx.broker.emit("balance."+statement.from, balance_from);

              // Update the balance if it exists, otherwise create a new one
              if (balances_to && balances_to.length > 0) {
                balance_to.in += balances_to[0].in;
                balance_to.out += balances_to[0].out;
                balance_to.id = balances_to[0].id;
                balance_to._id = balances_to[0]._id;
                balance_to.updated = new Date().getTime();
                
                if(typeof balance_to._id == 'undefined') balance_to._id = balance_to.id;
                if(typeof balance_to.id == 'undefined') balance_to.id = balance_to._id;

                await ctx.call("balancing"+cleared+"_model.update", balance_to);
              } else {
                await ctx.call("balancing"+cleared+"_model.insert", { entity: balance_to });
              }
              await ctx.broker.emit("balance."+statement.to, balance_to);
            } else { // if !sealed
              // handling settlments received after sealing of product (eq. booking on a closed balance)
              await ctx.call("postbalancing_model.insert", { entity: balance_from });
              await ctx.broker.emit("postbalance."+statement.from, balance_from);
              await ctx.call("postbalancing_model.insert", { entity: balance_to });
              await ctx.broker.emit("postbalance."+statement.to, balance_to);
              return null;
            }
          // Return the updated balance
          return statement;
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

        let balances = await ctx.call("balancing_model.find", {
          query: {
            assetId: ctx.params.assetId,
            epoch: ctx.params.epoch * 1,
            sealed: { $exists: false}
          },
        });
        let res = [];
        for(let i=0;i<balances.length;i++) {
          const _id = balances[i]._id;


          // Close Balance booking
          let intermediateBalance =  await ctx.call("balancing_model.find",{
            query:{
              assetId: balances[i].assetId,
              epoch:  balances[i].epoch * 1
            },
          });
          if(intermediateBalance.length > 0) {
            intermediateBalance = intermediateBalance[0];
            
            const closeBooking = await ctx.call("balancing.addSettlement",{
              meterId:balances[i].assetId,
              epoch: intermediateBalance.epoch,
              consumption: intermediateBalance.out - intermediateBalance.in,
              label: ".clearing",
              isClose: true
            });
            if(closeBooking == null) {
               // This is the case if close booking could not be made - we need to keep it open for later processing.             
            } else {
              delete intermediateBalance._id;
              delete intermediateBalance.id;
              const signOptions = JSON.parse(process.env.JWT_OPTIONS);

              res.push(await ctx.call("balancing_model.update", {
                  id:_id,
                    sealed: jwt.sign(closeBooking, process.env.JWT_PRIVATEKEY,signOptions)
              }));
            }
          }


        }
        return res;
      },
    }
  },
}