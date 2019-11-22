#!/usr/bin/env node

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const readline = require('readline');
const mappingmod =  require('./mappingmod.js');
const partmod = require('./partmod.js');
const seedrandom =  require('seedrandom');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});



function ask(question, placeholder) {
    return new Promise((resolve) => {
        rl.question(question, (name) => {
            if (name === "" && placeholder)
                resolve(placeholder)
            else
                resolve(name)

        })
    })
}


function die(error) {
    console.error(error)
    process.exit(1);
}



var gitorigin = ''
const upstream = "https://github.com/Shakthi/threeuniverse.git";



async function main() {
    const { stdout } = await exec('git config --get remote.origin.url');
    gitorigin = stdout.trim()

    const answer = await ask(`Enter the git url you want to push the repo [${gitorigin}]:`);
    if (answer != "")
        gitorigin = answer;

    if (gitorigin == upstream)
        die(`Cannot setup repo for upstream url [${gitorigin}]`);

    if (fs.existsSync('CNAME')) {
        console.log('Deleting CNAME file for non upstream repo')
        fs.unlinkSync('CNAME')
    }
    
    let partnamehint=null;
    let githubPageUrl;
    {
        const githubcommonurlre = /https:\/\/github.com\/([A-Za-z0-9]+)\/threeuniverse.git/
        const result = githubcommonurlre.exec(gitorigin)
        if (result != null) {
            const user = result[1];
            githubPageUrl = `https://${user}.github.io/threeuniverse/`

        } else {

            const githubcommonurlre = /https:\/\/github.com\/threeuniverse\/([A-Za-z0-9]+)\/?/
            const result = githubcommonurlre.exec(gitorigin)
            if (result != null) {
                const repo = result[1];
                githubPageUrl = `https://threeuniverse.github.io/${repo}/`
                partnamehint = repo;
            } else {

                const githubcommonurlre = /https:\/\/github.com\/threeuniverse\/([A-Za-z0-9]+).git/
                const result = githubcommonurlre.exec(gitorigin)
                if (result != null) {
                    partnamehint = repo;
                    const repo = result[1];
                    githubPageUrl = `https://threeuniverse.github.io/${repo}/`
                }

            }

        }

    }

    githubPageUrl = await ask(`Url git hub page fot the repo [${githubPageUrl}]:`, githubPageUrl)
    const partFileName = await ask(`Name of the partfile you want to setup [${partnamehint}]:`,partnamehint)
    const finaljs = githubPageUrl+"src/universe_parts/"+partFileName+".js"
    console.log("Final Url will be:",finaljs);

    partmod.createASperePart(partFileName);
    
    const xz={x:0,z:0}
    {
        const prg = new seedrandom()
        const samplex = ((prg() * 2 - 1) * 10000).toFixed(0)
        const sampley = ((prg() * 2 - 1) * 10000).toFixed(0);
        const sampleurl = `https://threeuniverse.org/#x:${samplex}&z:${sampley}`

        const answer = await ask(`Enter the sample coordinate url you want to setup the base [${sampleurl}]:`)
        const coordinateUrl = answer == "" ? sampleurl : answer;

        try {
            const xztemp = coordinateUrl.split('#')[1].split('&');
            xz.x = xztemp[0].split('x:')[1];
            xz.z = xztemp[1].split('z:')[1];
        } catch (error) {
            console.error(error)
        }

        let mapingdata = {
            position: { x:xz.x,z:xz.z},
            url: finaljs,
        }

        mappingmod.open();
        mappingmod.setLocalPart(githubPageUrl);
        mappingmod.appingNewPartViaMarker(mapingdata);
        mappingmod.write();
        console.log("Modfied maping file, run universepull to recive change")
    }
    rl.close();
}
main();

