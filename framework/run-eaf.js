"use strict";

/**
 * Fork to moleculer-runner.js 
 *  
 */

const { Runner } = require("moleculer");

const runner = new Runner();
runner.start(process.argv);