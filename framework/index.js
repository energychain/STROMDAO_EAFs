module.exports = {
    node: function() {
        var os = require("os");
        
        if(typeof process.env["EAF_NODE_ID"] == 'undefined') {
            process.env["EAF_NODE_ID"] = 'node_'+os.hostname();
        }
        const { Runner } = require("moleculer");
        let runnerArgs = [];
        runnerArgs.push(process.argv[0]);
        runnerArgs.push(process.argv[1]);
        const runner = new Runner();
        runner.start(runnerArgs);

    }
}