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
                                                         
let package_json = {
  license: "Property of STROMDAO GmbH",
  name: "STROMDAO Energy Application Framework (custom build)",
  version: "0.0.1"
}                
try {
  if(fs.existsSync("./package.json")) {
    package_json = JSON.parse(fs.readFileSync("./package.json"));
  }
  if(fs.existsSync("node-modules/stromdao-eaf/package.json")) {
    package_json = JSON.parse(fs.readFileSync("node-modules/stromdao-eaf/package.json"));
  }
} catch(e) {

}
 
console.log("Open-Source Energy Application Framework");
console.log("License: " + package_json.license);
console.log("Running: " + package_json.name + " " + package_json.version);


process.chdir(__dirname); // Might need to remember original cwd.

/*
//  Ensure that we find services in the module folder sevices/ and integration services in the cwd.
for(let i=1;i<process.argv.length;i++) {
  if(process.argv[i].indexOf("services") == 0) {
    process.argv[i] = __dirname + "/" + process.argv[i];
  }
}
*/

const runner = new Runner();
runner.start(process.argv);