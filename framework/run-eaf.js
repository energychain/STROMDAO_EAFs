#!/usr/bin/env node

const { spawn } = require('child_process');

const moleculerRunnerPath = './node_modules/moleculer/bin/moleculer-runner.js';

console.log("moleculerRunnerPath", moleculerRunnerPath);

const args = process.argv.slice(2);

const childProcess = spawn('node', [moleculerRunnerPath, ...args], {
  stdio: 'inherit',
});

childProcess.on('exit', (code) => {
  process.exit(code);
});
