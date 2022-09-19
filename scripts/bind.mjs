import * as fs from 'fs';
import arg from 'arg';

const args = new arg({
    '--api-url': String,
    '--api-key': String
})

async function bind() {
    try{
        const reqs = [('--api-url', '--api-key')]
        reqs.forEach((a) => {
            if(!args[a]) throw new Error(`missing required argument ${a}`)
        })

        console.log(`api-url: ${args['--api-url']}`)
        console.log(`api-key: ${args['--api-key']}`)

        const config = {
            aws_appsync_graphqlEndpoint: args['--api-url'],
            aws_appsync_apiKey: args['--api-key'],
            aws_appsync_authenticationType: 'API_KEY',
        }

        //write to file
        await fs.writeFile('src/export.json', JSON.stringify(config), err => {
            if (err) console.error(err);
            else console.log('Outputs written successfully');
        });

    } catch (error) {
        return console.log(`Error: ${error.message}`)
    }
}

bind();