#!/usr/bin/env node

let argv = require('minimist')(process.argv.slice(2));

const app = async function() {
    if(argv._.length > 0) {
        let command = argv._[0];
        argv._ = argv._.slice(1);
        console.log(await (require('./commands/' + command))(argv));
    }
}

app();