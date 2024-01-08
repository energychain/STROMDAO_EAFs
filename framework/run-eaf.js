#!/usr/bin/env node

"use strict";

/**
 * Fork to moleculer-runner.js 
 *  
 */

const { Runner } = require("moleculer");
const fs = require("fs");
console.log(' _____ _______ _____   ____  __  __ _____          ____  ');
console.log('/ ____|__   __|  __ \ / __ \|  \/  |  __ \   /\   / __ \ ');
console.log('| (___    | |  | |__) | |  | | \  / | |  | | /  \ | |  | |');
console.log('\___ \   | |  |  _  /| |  | | |\/| | |  | |/ /\ \| |  | |');
console.log('____) |  | |  | | \ \| |__| | |  | | |__| / ____ \ |__| |');
console.log('|_____/   |_|__|_|  \_\\____/|_|  |_|_____/_/    \_\____/ ');
console.log('           |  ____|   /\   |  ____|                       ');
console.log('   ______  | |__     /  \  | |__     ______               ');
console.log('   |______| |  __|   / /\ \ |  __|   |______|             ');
console.log('           | |____ / ____ \| |                            ');
console.log('           |______/_/    \_\_|                            ');
                                                         
                                                         
const package_json = JSON.parse(fs.readFileSync("./package.json"));
console.log("Open-Source Energy Application Framework");
console.log("License: " + package_json.license);
console.log("Running: " + package_json.name + " " + package_json.version);


const runner = new Runner();
runner.start(process.argv);