"use strict";
/**
 *  Handels approved audits - Hooks for external service calls might be added here.
 */


const DbService = require("moleculer-db");

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "audit",

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
        requestApproval: {
            params: {
            },
            rest: {
                      method: "GET",
                      path: "/requestApproval"
                  },
            async handler(ctx) {
                let result = {
                    service: ctx.options.parentCtx.service.fullName,
                    success: false,
                    type: "info",
                    payload:{}
                }
                ctx.params._service = ctx.options.parentCtx.service.fullName;
                let audits = await ctx.call("auditrule_model.find",{query:{service:ctx.params._service}});
                if(audits.length == 0) {
                    result.success = true;
                    result.type = "ignore";
                } else {
                    for(let i=0;i<audits.length;i++) {
                        let success = true;
                        result.type = audits[i].type
                        try {
                            const axios = require("axios");
                            let res = await axios.post(audits[i].webhook,ctx.params);
                            result.payload = res.data;
                        } catch(e) {                            
                            result.payload = e;
                            if(audits[i].type !== "ignore") {
                                success = false;
                            }
                        }       
                        result.success = success;               
                    }
                }
                result.auditId = await ctx.call("access.randomString",{length:10});
                await ctx.call("audit_model.insert",{entity:result});
                ctx.broker.broadcast("audit.approval",result);
                return result;
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
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
