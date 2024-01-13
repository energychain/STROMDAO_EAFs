"use strict";
/**
 * Bridge to Nextcloud storage
 */

const axios = require("axios");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
  name: "nextcloud",

  /**
   * Dependencies
   */
  dependencies: [],

  /**
   * Actions
   */
  actions: {
    createAssetShare: {
      rest: {
        method: "GET",
        path: "/createAssetShare",
      },
      timeout: 900000,
      params: {
        assetId: "string",
        assetType: "string",
      },
      async handler(ctx) {
        ctx.params.assetType = ctx.params.assetType.toLowerCase();
        const NEXTCLOUD_URL = process.env["NEXTCLOUD_URL"];
        const creds = Buffer.from(
          process.env.NEXTCLOUD_USER +
            ":" +
            process.env.NEXTCLOUD_PASSWORD
        ).toString("base64");

        // Check if existing user
        let asset = await ctx.call("asset.get", {
          assetId: ctx.params.assetId,
        });

        // If the asset doesn't exist or doesn't have Nextcloud credentials, create a new user
        if (
          typeof asset == "undefined" ||
          asset == null ||
          typeof asset.nextcloud == "undefined"
        ) {
          ctx.params.email =
            ctx.params.assetId +
            "@" +
            ctx.params.assetType +
            ".stromdao-eaf.local";
          ctx.params.displayName = ctx.params.assetType + " " + ctx.params.assetId;
          ctx.params.username = ctx.params.assetId;
          ctx.params.password = await ctx.call("access.randomString", {
            length: 18,
          });

          // Check if the user already exists
          const userExists = await axios.post(
            NEXTCLOUD_URL + "ocs/v1.php/cloud/users",
            {
              userid: ctx.params.username,
              password: ctx.params.password,
            },
            {
              headers: {
                "OCS-APIRequest": "true",
                Authorization: "Basic " + creds,
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          );

          const nextcloud_credentials = {
            password: ctx.params.password,
            username: ctx.params.username,
            success: true,
          };

          await ctx.call("asset.upsert", {
            nextcloud: nextcloud_credentials,
            assetId: ctx.params.assetId,
            type: ctx.params.assetType,
          });
        }

        // At this point we know that the user exists

        // Pre Requesit:
        // - EAF Folder exists
        // - Type Folder exists

        const userFolder = encodeURI(
          NEXTCLOUD_URL +
            "remote.php/dav/files/" +
            process.env.NEXTCLOUD_USER +
            "/stromdao-eaf/" +
            ctx.params.assetId +
            ""
        );
        let err = null;

        try {
          const response = await axios({
            method: "MKCOL",
            url: userFolder,
            auth: {
              username: process.env.NEXTCLOUD_USER,
              password: process.env.NEXTCLOUD_PASSWORD,
            },
          });
        } catch (error) {
          err = {
            message:
              "Unable to create folder in /stromdao-eaf/" + ctx.params.assetId + "",
            error: error.response.data,
            status: error.response.status,
          };
          console.error(
            "Error creating userFolder:",
            error.response.status,
            error.response.data
          );
        }

        const transferFolder = encodeURI(
          NEXTCLOUD_URL +
            "remote.php/dav/files/" +
            process.env.NEXTCLOUD_USER +
            "/stromdao-eaf/" +
            ctx.params.assetId +
            "/transfer"
        );

        try {
          const response = await axios({
            method: "MKCOL",
            url: transferFolder,
            auth: {
              username: process.env.NEXTCLOUD_USER,
              password: process.env.NEXTCLOUD_PASSWORD,
            },
          });
        } catch (error) {
          err = {
            message:
              "Unable to create folder in /stromdao-eaf/" +
              ctx.params.assetId +
              "/transfer",
            error: error.response.data,
            status: error.response.status,
          };
          console.error(
            "Error creating userFolder:",
            error.response.status,
            error.response.data
          );
        }

        // Share the transfer folder with the new user
        const shareTransferFolder = await axios.post(
          NEXTCLOUD_URL + `ocs/v1.php/apps/files_sharing/api/v1/shares`,
          {
            path: "/stromdao-eaf/" + ctx.params.assetId + "/transfer",
            shareType: 0,
            shareWith: ctx.params.assetId,
            permissions: 31,
            name: ctx.params.assetType,
          },
          {
            headers: {
              "OCS-APIRequest": "true",
              Authorization: "Basic " + creds,
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        console.log("shareTransferFolder", shareTransferFolder.data);

        return {
          error: err,
          assetId: ctx.params.assetId,
        };
      },
    },
  },

  /**
   * Events
   */
  events: {},

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