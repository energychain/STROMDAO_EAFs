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
        }
        let res = await ctx.call("balancing_model.find",{
          query:{
            assetId: ctx.params.assetId,
            epoch:  {$lt: ctx.params.epoch * 1 }
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
        if((typeof ctx.params.epoch == 'undefined')||(ctx.params.epoch == null)) {
          ctx.params.epoch = Math.floor(new Date().getTime() / process.env.EPOCH_DURATION);
        }
        let res = await ctx.call("statement_model.find",{
          query:{
            assetId: ctx.params.assetId,
            epoch: ctx.params.epoch
          }
        });
        for(let i=0;i<res.length;i++) {
         delete res[i]._id;
         delete res[i].id;
        }
        // we might return multiple balances for different labels
        return res;
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
       * @return {Object} The updated balance object after balancing the energy exchange.
       */
      async handler(ctx) {
        ctx.params.consumption = Math.round(ctx.params.consumption);
        // Check if we have a balancing rule for this asset.
        const asset = await ctx.call("asset.get", { assetId: ctx.params.meterId });

        // Initialize the statement and balance objects
        let statement = {
          from: 'eaf_general',
          to: ctx.params.meterId,
          epoch: ctx.params.epoch,
          energy: ctx.params.consumption,
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
          }
          if (asset.balancerule.to) {
            statement.to = asset.balancerule.to;
          }
        } else {
          // If there is no balancing rule, the energy is considered to be consumed locally
      
        }

        // Insert the statement into the database
        await ctx.call("statement_model.insert", { entity: statement });
        await ctx.broker.emit("transferfrom."+statement.from, ctx.params.consumption);
        await ctx.broker.emit("transferto."+statement.to, ctx.params.consumption);

        // Find any existing balance for the given asset and counter asset at epoch
        let balance_from = {
          assetId: statement.from,
          epoch: ctx.params.epoch,
          in: 0,
          out: 1 * ctx.params.consumption,
          label: ctx.params.label,
          created: new Date().getTime(),
        };

        const balances_from = await ctx.call("balancing_model.find", {
          query: {
            label: ctx.params.label,
            epoch: ctx.params.epoch,
            assetId: statement.from,
          },
        });
        

        // Update the balance if it exists, otherwise create a new one
        if (balances_from && balances_from.length > 0) {
          balance_from.in += balances_from[0].in;
          balance_from.out += balances_from[0].out;
          balance_from.id = balances_from[0].id;
          balance_from._id = balances_from[0]._id;
          if (typeof balance_from._id == 'undefined') balance_from._id = balance_from.id;
          if(typeof balance_from.id == 'undefined') balance_from.id = balance_from._id;

          await ctx.call("balancing_model.update", balance_from);
        } else {
          await ctx.call("balancing_model.insert", { entity: balance_from });
        }
        await ctx.broker.emit("balance."+statement.from, balance_from);

        let balance_to = {
          assetId: statement.to,
          epoch: ctx.params.epoch,
          in: 1 * ctx.params.consumption,
          out: 0,
          label: ctx.params.label,
          created: new Date().getTime(),
        };

        const balances_to = await ctx.call("balancing_model.find", {
          query: {
            label: ctx.params.label,
            epoch: ctx.params.epoch,
            assetId: statement.to,
          },
        });
        

        // Update the balance if it exists, otherwise create a new one
        if (balances_to && balances_to.length > 0) {
          balance_to.in += balances_to[0].in;
          balance_to.out += balances_to[0].out;
          balance_to.id = balances_to[0].id;
          balance_to._id = balances_to[0]._id;
          if(typeof balance_to._id == 'undefined') balance_to._id = balance_to.id;
          if(typeof balance_to.id == 'undefined') balance_to.id = balance_to._id;

          await ctx.call("balancing_model.update", balance_to);
        } else {
          await ctx.call("balancing_model.insert", { entity: balance_to });
        }
        await ctx.broker.emit("balance."+statement.to, balance_to);


        // Return the updated balance
        return {
          to:balance_to,
          from:balance_from
        };
      },
    },
  },
}