module.exports = {
    node: async function() {
        var os = require("os");

        if(typeof process.env["EAF_NODE_ID"] == 'undefined') {
            process.env["EAF_NODE_ID"] = 'node_'+os.hostname();
        }
        const { Runner } = require("moleculer");
        let runnerArgs = [];
        runnerArgs.push(process.argv[0]);
        runnerArgs.push(process.argv[1]);
        if(typeof process.env["EAF_SERVICES"] !== 'undefined') {
            runnerArgs.push(process.env["EAF_SERVICES"]);
        } else {
            runnerArgs.push(__dirname + "/services/**/*.service.js");
        }
        const runner = new Runner();
        await runner.start(runnerArgs);
        return runner.broker;

    }
}