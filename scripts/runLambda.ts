
import * as AWS from 'aws-sdk';
AWS.config.region = 'us-east-1';
import { program } from 'commander';

program
    .option('-u, --url <url>', 'Youtube channel url')
    .option('-n, --nbOfExecution <nbOfExecution>', 'Number of time to run the clicker (e.g remember that the scraper can return up to 30 urls, so if nbOfExecution is 2 that mean 30*2) ')

program.parse(process.argv);

const options = program.opts();
const url: string = options.url;
if (!url || url.indexOf('/videos') === -1) {
    throw new Error('Please provide a direct url to the youtube channel videos like https://www.youtube.com/c/channelName/videos');
}
options.nbOfExecution = Number(options.nbOfExecution);
if (options.nbOfExecution && (!Number.isInteger(options.nbOfExecution) || options.nbOfExecution < 1)) {
    throw new Error('Number of execution must be 1 or bigger');
}

const lambda = new AWS.Lambda();

invoke('serveless-puppeteer-dev-scraper', options.url, (data) => {
    const response = JSON.parse(data.Payload.toString());
    console.log(JSON.stringify(response, null, 2));
    const { body, statusCode: lambdaResponseStatusCode } = response;
    if (lambdaResponseStatusCode !== 200) {
        console.error(`Lambda Status = ${lambdaResponseStatusCode}`);
        return;
    }
    const urls = body.map(param => param?.queryStringParameters?.url);
    Array(Number(options.nbOfExecution) || 1).fill(urls).flat().map((url: string) => invoke('serveless-puppeteer-dev-clicker', url));
    if (options.nbOfExecution) {
        console.log(`Invoked clicker ${options.nbOfExecution} times for each video`);
    }
});

function invoke(functionName: string, url: string, callback?: (data: AWS.Lambda.InvocationResponse) => void) {
    console.log(`Invoking ${functionName} with ${url}`);
    const params = {
        FunctionName: functionName,
        InvocationType: 'RequestResponse',
        LogType: 'Tail',
        Payload: `{\"queryStringParameters\":{\"url\":\"${url}\"}}`
    };

    lambda.invoke(params, function (err, data) {
        if (err) {
            console.error(err);
        } else {
            if (data.StatusCode !== 200) {
                console.error(`Status = ${data?.StatusCode}`);
                return;
            }
            console.log(data.Payload);
        }
        if (callback) {
            callback(data);
        }
    })
}
