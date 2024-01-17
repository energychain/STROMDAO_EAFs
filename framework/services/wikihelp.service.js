"use strict";
/**
 *  Model to derive load profiles for predictive and statistical use for meters
 */
const fs = require('fs');
const path = require('path');

/**
 * @typedef {import('moleculer').ServiceSchema} ServiceSchema Moleculer's Service Schema
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

/** @type {ServiceSchema} */
module.exports = {
	name: "wikihelp",
	

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
        assets: {
			rest: {
				method: "GET",
				path: "/assets"
			},
			async handler(ctx) {
                const __dirname = path.dirname(__filename);
                const docsDirectory = path.join(__dirname, '../docs');
                // Liste aller Dateien mit der Endung ".md" im Verzeichnis "../docs/"
                const markdownFiles = fs.readdirSync(docsDirectory).filter(file => path.extname(file) === '.md').map(file => path.basename(file, '.md'));;
                let content ={};
                let meta = {};
                for(let i=0;i<markdownFiles.length;i++) {
                    const markdown = fs.readFileSync(path.join(docsDirectory, `${markdownFiles[i]}.md`), 'utf-8');
                    const frontmatterStart = markdown.indexOf('---');
                    const frontmatterEnd = markdown.indexOf('---', frontmatterStart + 3);
                    content[markdownFiles[i]] = markdown.substring(frontmatterEnd + 3);
                    const frontmatter  = markdown.substring(frontmatterStart + 3, frontmatterEnd);

                    const metaObject = {};
                    const lines = frontmatter.split('\n');
                    for (const line of lines) {                      
                        const parts = line.split(':');
                        if(parts.length > 1) {
                            const key = parts[0].trim().trim().replace(/\r/g, '').toLocaleLowerCase();
                            const value = parts[1].trim().trim().replace(/\r/g, '');
                            metaObject[key] = value;
                            if(key == 'tags') {
                                metaObject['tags'] = value.split(',');
                                for(let i=0;i<metaObject['tags'].length;i++) {
                                    metaObject['tags'][i] = metaObject['tags'][i].trim();
                                }
                            }
                        }
                    }
                    meta[markdownFiles[i]] = metaObject;
                }
				return meta;
			}
		},
        get: {
			rest: {
				method: "GET",
				path: "/get"
			},
            params: {
                name: "string"
            },
			async handler(ctx) {
                ctx.params.name = ctx.params.name.replace(/ /g, '-').replace(/\//g, '-');

                const __dirname = path.dirname(__filename);
                const docsDirectory = path.join(__dirname, '../docs');

                const markdown = fs.readFileSync(path.join(docsDirectory, `${ctx.params.name}.md`), 'utf-8');

                const frontmatterStart = markdown.indexOf('---');
                const frontmatterEnd = markdown.indexOf('---', frontmatterStart + 3);
                const content = markdown.substring(frontmatterEnd + 3);

                ctx.meta.$responseType = "text/plain; charset=utf-8";
				return content;
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
