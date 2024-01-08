#!/usr/bin/env node

"use strict";

/**
 * Fork to moleculer-runner.js 
 *  
 */

const { Runner } = require("moleculer");
const fs = require("fs");
require("dotenv").config();

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
let package_json_file = "package.json";

let workfolder = process.cwd();
let installfolder = __dirname;

try {
  if(fs.existsSync(workfolder + "/package.json")) package_json_file = workfolder + "/package.json";
  if(fs.existsSync(installfolder + "/package.json")) package_json_file = installfolder + "/package.json";
  package_json = JSON.parse(fs.readFileSync(package_json_file));
} catch(e) {
  console.log("Error: " + e);
}

if((typeof process.env["EAF_WORK"] == 'undefined')||(process.env["EAF_WORK"] == 'null')) process.env["EAF_WORK"] = workfolder;
if((typeof process.env["EAF_INSTALL"] == 'undefined')||(process.env["EAF_INSTALL"] == 'null')) process.env["EAF_INSTALL"] = installfolder;
let services = process.env["EAF_INSTALL"]+"/services/**/*.service.js";

if(process.argv[2] == "integration") { 
  services = process.env["EAF_WORK"]+"/services-integration/**/*.service.js";
}

console.log("Open-Source Energy Application Framework");
console.log("--------------------------------------------------");
console.log("License: " + package_json.license);
console.log("Running: " + package_json.name + " " + package_json.version);
console.log("Workfolder: " + process.env["EAF_WORK"]);
console.log("Installation: "+  process.env["EAF_INSTALL"]);
console.log("Services: "+  services);
console.log("Package.json: "+ package_json_file);
console.log("Data Store", process.env["db_adapter"]);
console.log("--------------------------------------------------");

process.chdir(process.env["EAF_INSTALL"]); // Might need to remember original cwd.

let runnerArgs = [];
runnerArgs.push(process.argv[0]);
runnerArgs.push(process.argv[1]);
runnerArgs.push(services);

const runner = new Runner();
runner.start(runnerArgs);