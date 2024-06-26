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
const ROOT_BALANCE_GROUP = "eaf_generic_balancegroup";

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
				if((typeof ctx.params.q == 'undefined') || (ctx.params.q.length == 0)) {
					return (await ctx.call("balance_settlements_active_model.list",{ pageSize: 50,sort:"-epoch"})).rows;
				} else {
					return await ctx.call("balance_settlements_active_model.find",{search:ctx.params.q,searchFields:['from','to']});
				}
			}
		},
    // Action to add a settlement from a meter to the energy balancing model
    peers: {
      rest: {
				method: "GET",
				path: "/peers"
			},
      params: {
        assetId: "string",
      },
      async handler(ctx) {
        const peers = await ctx.call("asset.query",{q:{"$or":[{"balancerule.from":ctx.params.assetId},{"balancerule.to":ctx.params.assetId}]}});
        return peers;
      }
    },
    latestBalances: {
			rest: {
				method: "GET",
				path: "/latestBalances"
			},
      cache: true, 
      params: {
        assetId: "string",
      },
      /**
       * Returns the top n balances sealed models for a given asset ID.
       *
       * @param {Object} ctx - The context object containing the request parameters.
       * @param {string} ctx.params.assetId - The ID of the asset for which to retrieve the balances sealed models.
       * @param {number} [ctx.params.n=1] - The number of balances sealed models to retrieve (default is 1).
       * @return {Promise<Array>} A promise that resolves to an array of the top n balances sealed models.
       */
      async handler(ctx) {
        if(typeof ctx.params.n == 'undefined') ctx.params.n = 1; else ctx.params.n *= 1;
        let top = [];
        let query =  {
          "$or": [ { "from": ctx.params.assetId }, { "to": ctx.params.assetId}],
        };
        if((typeof ctx.params.before !== 'undefined') && (!isNaN(ctx.params.before))) {
            query.epoch = { $lt: ctx.params.before *1 };
        }
        const settlements = await ctx.call("balance_settlements_active_model.find", {
          query,
          limit: 1,
          sort: "-epoch"
        });
        if(settlements.length == 0) {
          return top;
        }
        const top_epoch = settlements[0].epoch;
        for(let e = top_epoch;(e > top_epoch - (ctx.params.n));e--) {
          const epoch_balance = await ctx.call("balancing.balance", {
            assetId: ctx.params.assetId,
            epoch:e
         });
         top.push(epoch_balance);
        }

        for(let i=0;i<top.length;i++) {
          if(typeof top[i].time == 'undefined') {
            top[i].time = top[i].epoch * process.env.EPOCH_DURATION;
          }
        }

        return top;
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

        const upstream_from = await ctx.call("balancing.getUpstream",{ assetId: ctx.params.assetId,energy:-1 });
        const upstream_to = await ctx.call("balancing.getUpstream",{ assetId: ctx.params.assetId,energy:1 });

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
          if((res[i].to == upstream_to) || (res[i].from == upstream_from)) {
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
        if(typeof ctx.params.energy == 'undefined') {
          ctx.params.energy = -1;
        }
        let upstream = ROOT_BALANCE_GROUP;
        const asset = await ctx.call("asset.get", { assetId: ctx.params.assetId,type:"balance" });
        if (asset && asset.balancerule) {
          if(typeof asset.balancerule.from !== 'undefined') {
            if(ctx.params.energy <0 ) {
              upstream = asset.balancerule.from;
            }
          }
          if(typeof asset.balancerule.to !== 'undefined') {
            if(ctx.params.energy > 0) {
              upstream = asset.balancerule.to;
            }
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
          console.log("Asset Info",asset);
          // Initialize the statement and balance objects
          let statement = {
            from: ROOT_BALANCE_GROUP,
            to: ctx.params.meterId,
            epoch: ctx.params.epoch * 1,
            energy: ctx.params.consumption,
            label: ctx.params.label,
            co2eq: Math.round(ctx.params.co2eq),
            counter: ROOT_BALANCE_GROUP         
          };

          // Apply the balancing rule if one exists
          if((typeof asset == 'undefined')||(asset == null)) {
              await ctx.call("asset.upsert",{
                type:"balance",
                assetId:ctx.params.meterId,
                balance_activated:new Date().getTime()
              })
          } else if (asset && asset.balancerule) {
            if (asset.balancerule.from) {
              statement.from = asset.balancerule.from;
              statement.counter =  asset.balancerule.from;
            }
            if (asset.balancerule.to) {
              statement.from = ctx.params.meterId; 
              statement.to = asset.balancerule.to;
              statement.counter =  asset.balancerule.to;
            }
            await ctx.call("asset.upsert",{
              type:"balance",
              assetId:ctx.params.meterId,
              balance_updated:new Date().getTime()
            })
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
          if(typeof ctx.params.autoseal !== 'undefined') {
            ctx.call("balancing.seal",{
              assetId:ctx.params.meterId,
              epoch:ctx.params.epoch - (1*ctx.params.autoseal)
            },{timeout:120000});
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
    isSealed: {
      params: {
        assetId: { type: "string" },
        epoch: { type: "any" }
      },
      rest: {
				method: "GET",
				path: "/isSealed"
			},
      async handler(ctx) {
        let res= await ctx.call("balances_sealed_model.find", {
          query: {
            assetId: ctx.params.assetId,
            epoch: ctx.params.epoch * 1,
            seal: {$exists: true}
          }
        });
        if(res.length == 0) {
          return false;
        } else return true;
      }
    },
    balance: {
      params: {
        assetId: { type: "string" },
        epoch: { type: "any" }
      },
      cache: true, 
      rest: {
				method: "GET",
				path: "/balance"
			},
      async handler(ctx) {
        let res= await ctx.call("balances_sealed_model.find", {
          query: {
            assetId: ctx.params.assetId,
            epoch: ctx.params.epoch * 1,
            seal: {$exists: true}
          }
        });
        if(res.length == 0) {
          res = await ctx.call("balancing.unsealedBalance",ctx.params);
          if(res.clearing.energy !== 0) {
            res.energy = (-1) * res.clearing.energy; 
          }
          res.energy *= -1;
        } else {
          res= res[0];
        }
        // check peers
        let froms = {};
        let tos = {};
        let total_from = 0;
        let total_to = 0;
        for(let i=0;i<res.transactions.length;i++) {
          if(res.transactions[i].label !== '.end') {
              if(res.transactions[i].from !== ctx.params.assetId) {
                  if(typeof froms[res.transactions[i].from] === 'undefined') {
                      froms[res.transactions[i].from] =  { energy: 0,tx:{} }; ;
                  }
                  froms[res.transactions[i].from].energy += res.transactions[i].energy;
                  total_from += 1* res.transactions[i].energy;
              }
              if(res.transactions[i].to !== ctx.params.assetId) {
                if(typeof tos[res.transactions[i].to] === 'undefined') {
                    tos[res.transactions[i].to] = {energy:0,tx:{}} ;
                }
                tos[res.transactions[i].to].energy += res.transactions[i].energy;
                total_to += 1 * res.transactions[i].energy;
            }
          }
        }
        if(total_to>0) {
          for (const [key, value] of Object.entries(froms)) {
            for (const [key2, value2] of Object.entries(tos)) {
              froms[key].tx[key2] = Math.round((value2.energy/total_to) * value.energy);
              if(froms[key].tx[key2]==null) delete froms[key].tx[key2];
            }
          }
        }
        if(total_from>0) {
          for (const [key, value] of Object.entries(tos)) {
            for (const [key2, value2] of Object.entries(froms)) {
              tos[key].tx[key2] = Math.round((value2.energy/total_from) * value.energy);
              if(tos[key].tx[key2]==null) delete tos[key].tx[key2];
            }
          }
        }
        res.peers = {
          from: froms,
          to: tos
        }
        return res;
      }
    },
    sealedBalance: {
      params: {
        assetId: { type: "string" },
        epoch: { type: "any" }
      },
      rest: {
				method: "GET",
				path: "/sealedBalance"
			},
      async handler(ctx) {
        return await ctx.call("balances_sealed_model.find", {
          query: {
            assetId: ctx.params.assetId,
            epoch: ctx.params.epoch * 1,
            seal: {$exists: true}
          }
        });
      }
    },
    unsealedBalance: {
      params: {
        assetId: { type: "string" },
        epoch: { type: "any" }
      },
      rest: {
				method: "GET",
				path: "/unsealedBalance"
			},
      async handler(ctx) {
        let sealcheck = await ctx.call("balances_sealed_model.find", {
          query: {
            assetId: ctx.params.assetId,
            epoch: ctx.params.epoch * 1,
            seal: {$exists: true}
          }
        });
        if(sealcheck.length !== 0) {
          console.error("balance already sealed",ctx.params);
          return { "err": "balance already sealed" };
        }

        let balance = {
          assetId: ctx.params.assetId,
          epoch: ctx.params.epoch * 1,
          in: 0,
          in_co2eq:0,
          out: 0,
          out_co2eq:0,
          energy: 0,
          upstream: "",
          upstreamenergy:0,
          upstreamco2eq:0,
          co2eq:0,
          clearing: {},
          transactions: []
        }

        const settlements = await ctx.call("balance_settlements_active_model.find", {
          query: {
            "$or": [ { "from": ctx.params.assetId }, { "to": ctx.params.assetId}],
            epoch: ctx.params.epoch * 1
          },
        });

        balance.upstream_from = await ctx.call("balancing.getUpstream", {assetId: ctx.params.assetId,energy:-1});
        balance.upstream_to = await ctx.call("balancing.getUpstream", {assetId: ctx.params.assetId,energy:1});
        
        let absenergy = 0;
        for(let i=0;i<settlements.length;i++) {
          if(settlements[i].from == ctx.params.assetId) {
            balance.out += settlements[i].energy * 1;
            balance.out_co2eq += settlements[i].co2eq * 1;
          } else {
            balance.in += settlements[i].energy * 1;
            balance.in_co2eq += settlements[i].co2eq * 1;
          }

          if(settlements[i].from == balance.upstream_from) {
            balance.upstreamenergy += settlements[i].energy * 1;
            balance.upstreamco2eq += settlements[i].co2eq * 1;
          } 
          if(settlements[i].to == balance.upstream_to) {
            balance.upstreamenergy -= settlements[i].energy * 1;
            balance.upstreamco2eq -= settlements[i].co2eq * 1;
          }
          balance.energy = balance.out - balance.in;
          balance.co2eq = balance.out_co2eq - balance.in_co2eq;
          balance.transactions.push(settlements[i]);
        }
        if(Math.abs(balance.out) > Math.abs(balance.in)) {
          absenergy += -1 * Math.abs(balance.out);
        } else {
          absenergy += 1 * Math.abs(balance.in);
        }

        if(balance.upstreamenergy > 0) {
          balance.upstream = balance.upstream_to;
        } else {
          balance.upstream = balance.upstream_from;
        }

        balance.balancesum = absenergy; 

        const energybalance = balance.energy + balance.upstreamenergy;
        const co2eqbalance = balance.co2eq + balance.upstreamco2eq;
        balance.clearing = {
          from:balance.upstream,
          to:ctx.params.assetId,
          epoch: ctx.params.epoch * 1,
          energy: energybalance,
          co2eq: co2eqbalance
        } 
        balance = await ctx.call("meritorder.probeBalance",balance);

        return balance;
      }
    },
    seal: {
      params: {
        assetId: { type: "string" },
        epoch: { type: "any" }
      },
      rest: {
				method: "GET",
				path: "/seal"
			},
      timeout:60000,
      openapi: {
        summary: "handles the sealing of balances",
        description:"1. First, the `jsonwebtoken` module is imported, which is used for signing tokens. These tokens are typically used for authentication or for sealing information.\n\n2. Next, the `balances_sealed_model.find` method is called with `ctx.call` to search for sealed balances (`seal`) for a specific `assetId` and `epoch`. If an entry is found, this means that the balance has already been sealed, and an error is returned.\n\n3. Then, the `balancing.unsealedBalance` service is called to determine an intermediate balance. The `balancesum` value of this intermediate balance is stored in `_balance`.\n\n4. It checks if both `energy` and `clearing.energy` are not zero. If so, a `statement` with various information is created and stored using the `balance_settlements_active_model.insert` method. Subsequently, an unsealed balance is requested again to potentially seal it.\n\n5. If `energy` or `clearing.energy` are zero, `balancesum` is halved and rounded. Afterward, the `audit.requestApproval` service is called to get an approval for the balance. If successful (`success`), an `auditId` is added to the balance and the `meritorder.process` service is called.\n\n6. After the balance has been approved, its contents are stored in `seal_content` and signed with JWT. The signed `seal_content` also includes the `transactions` from the intermediate balance and is then stored with `balances_sealed_model.insert` and broadcast with `ctx.broker.broadcast`.\n\n7. The signed balance content (`seal_content`) is returned.\n\n8. If the approval request fails (`audit`), an error message is logged and an error is thrown. Similarly, if it is found that the unsealed balance is not zero, which would indicate that there are still pending transactions that have not been processed.\n\nThus, the code handles the sealing of balances by checking if a balance is already sealed, creating an intermediate balance, obtaining approvals, and ultimately sealing the balance before storing and publishing it in the system. Errors and special cases are also handled, with corresponding error messages and, if necessary, exceptions.",
        tags: ["Balancing"],
        responses: {
          200: {
            description: "Success"
          }
        }
      },
      async handler(ctx) {
        const jwt = require("jsonwebtoken");

        let sealcheck = await ctx.call("balances_sealed_model.find", {
          query: {
            assetId: ctx.params.assetId,
            epoch: ctx.params.epoch * 1,
            seal: {$exists: true}
          }
        });
        if(sealcheck.length !== 0) {
          console.error("balance already sealed",ctx.params);
          return { "err": "balance already sealed" };
        }

        let intermediateBalance = await ctx.call("balancing.unsealedBalance",ctx.params);
        const _balance = intermediateBalance.balancesum;

        if((intermediateBalance.energy !== 0)&&(intermediateBalance.clearing.energy !== 0)){
          let statement = {
            from: intermediateBalance.clearing.from,
            to:intermediateBalance.clearing.to,
            epoch: ctx.params.epoch * 1,
            energy: intermediateBalance.clearing.energy,
            co2eq: intermediateBalance.clearing.co2eq,
            label: ".end"
          }
          if(statement.energy < 0) {
            const tmp_to = statement.to;
            statement.to = statement.from;
            statement.from = tmp_to; 
            statement.energy *= -1;
          }
          await ctx.call("balance_settlements_active_model.insert",{entity:statement});
          intermediateBalance = await ctx.call("balancing.unsealedBalance",ctx.params); // Hier könnte man die MOL danach abrufen
          // Fix who is upstream
       //   intermediateBalance.upstream = await ctx.call("balancing.getUpstream",{ assetId: ctx.params.assetId,energy:intermediateBalance.energy });
          // TODO: Handover info that balance will be sealed.
          intermediateBalance.seal = true;
        }
        if((intermediateBalance.energy == 0)||(intermediateBalance.clearing.energy == 0)) {
            intermediateBalance.balancesum = Math.round(intermediateBalance.balancesum/2);
            const audit = await ctx.call("audit.requestApproval",intermediateBalance);
            if( (audit).success ) {
              intermediateBalance.auditId = audit.auditId;
              await ctx.call("meritorder.process",intermediateBalance); // different to unsealedBalance Call! Just booking
              let seal_content = {
                assetId: ctx.params.assetId,
                epoch: ctx.params.epoch * 1,
                upstream: intermediateBalance.upstream,
                balancesum: _balance * 1, 
                energy: intermediateBalance.upstreamenergy,
                co2eq: intermediateBalance.upstreamco2eq,
                auditId: audit.auditId
              }

              const signOptions = JSON.parse(process.env.JWT_OPTIONS);
              const res = jwt.sign(seal_content, process.env.JWT_PRIVATEKEY,signOptions);
              seal_content.seal = res;
              seal_content.transactions = intermediateBalance.transactions;
              await ctx.call("balances_sealed_model.insert",{entity:seal_content});
              ctx.broker.broadcast("balances.sealed", seal_content);
              return seal_content;
            } else {
              console.error("Unable to seal balance. Audit failed",intermediateBalance,audit );
              throw "Unable to seal balance. Audit '"+audit.auditId+"' failed.";
            }
            
          } else {
            console.error("Unable to seal balance. Unsealed balance is not zero",intermediateBalance);
            // throw "Unable to seal balance. Unsealed balance is not zero";
          }
      },
    }
  },
}