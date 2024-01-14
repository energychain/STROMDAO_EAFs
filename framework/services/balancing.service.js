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
          from: 'general',
          to: ctx.params.meterId,
          epoch: ctx.params.epoch,
          energy: ctx.params.consumption,
        };

        let balance = {
          assetId: ctx.params.meterId,
          epoch: ctx.params.epoch,
          in: 0,
          out: 0,
          created: new Date().getTime(),
        };

        // Apply the balancing rule if one exists
        if (asset && asset.balancerule) {
          if (asset.balancerule.from) {
            statement.from = asset.balancerule.from;
            balance.in += ctx.params.consumption;
          }
          if (asset.balancerule.to) {
            statement.to = asset.balancerule.to;
            balance.out += ctx.params.consumption;
          }
        } else {
          // If there is no balancing rule, the energy is considered to be consumed locally
          balance.in += ctx.params.consumption;
        }

        // Insert the statement into the database
        await ctx.call("statement_model.insert", { entity: statement });
        await ctx.broker.emit("transferfrom."+statement.from, ctx.params.consumption);
        await ctx.broker.emit("transferto."+statement.to, ctx.params.consumption);
        // Find any existing balance for the given asset and epoch
        const balances = await ctx.call("balancing_model.find", {
          query: {
            label: ctx.params.label,
            epoch: ctx.params.epoch,
            assetId: ctx.params.meterId,
          },
        });
        

        // Update the balance if it exists, otherwise create a new one
        if (balances && balances.length > 0) {
          balance.in += balances[0].in;
          balance.out += balances[0].out;
          balance.id = balances[0].id;
          balance._id = balances[0]._id;
          if (typeof balance._id == 'undefined') balance._id = balance.id;
          await ctx.call("balancing_model.update", balance);
        } else {
          await ctx.call("balancing_model.insert", { entity: balance });
        }
        await ctx.broker.emit("balance."+ctx.params.meterId, balance);
        // Return the updated balance
        return balance;
      },
    },
  },
}