"use strict";

const axios = require("axios");

const INFLUXDB_URL = process.env["INFLUXDB_URL"];
const INFLUXDB_DATABASE = process.env["INFLUXDB_DATABASE"];

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
  name: "influx",

  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    writeMeasurement: {
      rest: {
        method: "GET",
        path: "/writeMeasurement",
      },
      params: {
        measurement: {
          type: "string",
        },
      },
      async handler(ctx) {

        function objectToInfluxLineProtocol(obj) {
          return Object.keys(obj).map(key => {
            let value = obj[key];

            if (typeof value === "string") {
              value = `"${value.replace(/"/g, '\\"')}"`; // Escape double quotes in string values
            }

            return `${key}=${value}`;
          }).join(",");
        }

        const writeEndpoint = `${INFLUXDB_URL}/write?db=${INFLUXDB_DATABASE}&precision=ns`; // ns for nanoseconds

        // Data in InfluxDB line protocol format
        const measurement = ctx.params.measurement;
        let tags = objectToInfluxLineProtocol(ctx.params.tags);
        let field = objectToInfluxLineProtocol(ctx.params.fields);
        let timestamp = Date.now() * 1e6; // converting current date to nanoseconds

        const data = `${measurement},${tags} ${field} ${timestamp}`;

        // Writing to InfluxDB using Axios
        try {
          const res = await axios.post(writeEndpoint, data);
          return res.data;
        } catch (error) {
          return {
            payload: data,
            err: error,
          };
        }
      },
    },
  },

  /**
   * Events
   */
  events: {
    "clearing.created"(ctx) {
      // return in case we  do not have a INFLUX_DB connection configured
      if((typeof INFLUXDB_URL == 'undefined') || (INFLUXDB_URL == null)) {
        return;
      }

      let measurement = {
        measurement: "clearing_"+ctx.params.meterId,
        tags: {
          type: "clearing",
        },
        fields: {
          reading: ctx.params.reading,
          epoch: ctx.params.epoch,
          endTime: ctx.params.endTime,
          cost: ctx.params.cost,
          consumption: ctx.params.consumption,
        },
      };
      for (const [key, value] of Object.entries(ctx.params)) {
        if (key.indexOf("cost_") == 0) {
          measurement.fields[key] = value;
        }
        if (key.indexOf("consumption_") == 0) {
          measurement.fields[key] = value;
        }
      }
      ctx.call("influx.writeMeasurement", measurement);
    },
    "debit.add"(ctx) {
        // return in case we  do not have a INFLUX_DB connection configured
        if((typeof INFLUXDB_URL == 'undefined') || (INFLUXDB_URL == null)) {
          return;
        }
  
        let measurement = {
          measurement: "aggregation_debit",
          tags: {
            type: "debit",
            epoch: ctx.params.epoch
          },
          fields: {
            cost: ctx.params.cost,
            consumption: ctx.params.consumption,
          },
        };
        ctx.call("influx.writeMeasurement", measurement);

        measurement.measurement = "debit_"+ctx.params.meterId;
        ctx.call("influx.writeMeasurement", measurement);
      },
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