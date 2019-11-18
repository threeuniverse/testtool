#!/usr/bin/env node

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const readline = require('readline');
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
            } else {

                const githubcommonurlre = /https:\/\/github.com\/threeuniverse\/([A-Za-z0-9]+).git/
                const result = githubcommonurlre.exec(gitorigin)
                if (result != null) {
                    const repo = result[1];
                    githubPageUrl = `https://threeuniverse.github.io/${repo}/`
                }

            }

        }

    }

    githubPageUrl = await ask(`Url git hub page fot the repo [${githubPageUrl}]:`, githubPageUrl)
    const partFileName = await ask(`Name of the partfile you want to setup [MyPart}]:`,"MyPart")
    const finaljs = githubPageUrl+"src/universe_parts/"+partFileName+".js"
    console.log("Final Url will be:",finaljs);

    const xz={x:0,z:0}
    {
        const samplex = (Math.random() * 2 - 1 * 10000).toFixed(0)
        const sampley = (Math.random() * 2 - 1 * 10000).toFixed(0);
        const sampleurl = `https://threeuniverse.org/#x:${samplex}&z:${1119}`

        const answer = await ask(`Enter the sample coordinate url you want to setup the base [${sampleurl}]:`)
        const coordinateUrl = answer == "" ? sampleurl : answer;

        try {
            const xztemp = coordinateUrl.split('#')[1].split('&');
            xz.x = xztemp[0].split('x:')[1];
            xz.z = xztemp[1].split('z:')[1];
        } catch (error) {
            console.error(error)
        }

        let mapingdata = `{
            position: { x:${xz.x},z:${xz.z}},
            credits: "https://www.turbosquid.com/",
            url: "${finaljs}",
        }`

        var string = fs.readFileSync("src/universe_parts/mapping.js").toString();
        string=string.replace(/local_part\ *=\ *\"https:\/\/threeuniverse.org\/"\ *;/,`local_part = "${githubPageUrl}"`)
        let linebegin=-1;
        let lineend=-1;
        string.split('\n').forEach((line,index)=>{
            if(line.search("//TODO:BEGIN APPEND //"))
                linebegin =index;
            if(line.search("//TODO:END APPEND //"))
            lineend =index;

        })

        if(linebegin!=-1&&lineend!=-1){
            
        }


        


        console.log(mapingdata);

    }
}
main();

