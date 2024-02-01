const fs = require("fs");

const app = async function() {
    const files = fs.readdirSync("./services/");
    let called = {};
    let callby = {};

    // Filter the files to only include those that end with .html.
    const services = files.filter((file) => file.endsWith('.service.js'));
    for(const service of services) {
        const implementation = require("./services/"+service); 
        if(typeof implementation.actions !== 'undefined') {
            for (const [key, value] of Object.entries(implementation.actions)) {
                if(value !== 'null') {
                    const sourceCode = value.handler.toString();

                    const function_calls = sourceCode.match(/ctx\.call\((["'])((?:(?!\1).)*)\1/gs);

                    if(function_calls !== null) {
                        for(let i=0;i<function_calls.length;i++) {
                            let mcall = function_calls[i].slice(10,-1);
                                let cservice = mcall.split('.')[0];
                                let cmethod = mcall.split('.')[1];
                                
                                if(typeof callby[cservice+'.'+cmethod] == 'undefined') {
                                    callby[cservice+'.'+cmethod] = {};
                                }
                                if(typeof callby[cservice+'.'+cmethod][implementation.name+'.'+key] == 'undefined') {
                                    callby[cservice+'.'+cmethod][implementation.name+'.'+key] = 0;
                                }
                                callby[cservice+'.'+cmethod][implementation.name+'.'+key]++;
                        }
                    }

                }
            }
        }
    }
    
    for(const service of services) {
        const implementation = require("./services/"+service); 
        let md = `# Service: ${implementation.name}\n`;

        if(typeof implementation.actions !== 'undefined') {

            for (const [key, value] of Object.entries(implementation.actions)) {
                if(value !== 'null') {
                    let mermaid = '```mermaid\n';
                    mermaid += 'graph TD\n';

                    md += `\n## Method `+key+`\n`;
                    if(typeof value.openapi !== 'undefined') {
                        if(typeof value.openapi.summary !== 'undefined') {
                            md += `**`+value.openapi.summary+`**\n`;
                        }
                        if(typeof value.openapi.description !== 'undefined') {
                            md += value.openapi.description+`\n`;
                        }
                    }
                    const sourceCode = value.handler.toString();
                    if(typeof callby[implementation.name+'.'+key] !== 'undefined') {
                        md += `### Called by:\n`;
                        for (const [servkey, servv] of Object.entries(callby[implementation.name+'.'+key])) {
                            md += `- [[`+servkey.split('.')[0]+`|service_`+servkey.split('.')[0]+`#method-`+servkey.split('.')[1]+`]].`+servkey.split('.')[1]+`()\n`;
                        }
                        md += `\n`;
                        for (const [servkey, servv] of Object.entries(callby[implementation.name+'.'+key])) {
                            mermaid += '   '+servkey+' --> '+implementation.name+'.'+key+'\n';
                        }
                    }

                    const function_calls = sourceCode.match(/ctx\.call\((["'])((?:(?!\1).)*)\1/gs);
                    if(function_calls !== null) {
                        md += `### Calls:\n`;
                   
                        for(let i=0;i<function_calls.length;i++) {
                            let mcall = function_calls[i].slice(10,-1);
                            let cservice = mcall.split('.')[0];
                            let cmethod = mcall.split('.')[1];
                            
                            md += `- [[`+cservice+`|service_`+cservice+`#method-`+cmethod+`]].`+cmethod+`()\n`;
                            if(typeof called[implementation.name+'.'+key] == 'undefined') {
                                called[implementation.name+ '.' + key] = {};
                            }
                            if(typeof called[implementation.name+'.'+key][cservice+'.'+cmethod] == 'undefined') {
                                called[implementation.name+'.'+key][cservice+'.'+cmethod] = 0;
                            }
                            called[implementation.name+'.'+key][cservice+'.'+cmethod]++;

                            mermaid += '   '+implementation.name+'.'+key+' --> '+cservice+'.'+cmethod+'\n';

                        }
                        md += `\n`;
                    } 
                    mermaid += '``` \n';
                    mermaid += `\n`;
                    md += mermaid;

                }
            }
        }
        console.log(service);
        fs.writeFileSync("./docs/service_"+service.slice(0,-11)+".md", md);
    }
   
}

app();