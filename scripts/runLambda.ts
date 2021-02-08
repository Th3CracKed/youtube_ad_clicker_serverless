
import * as AWS from 'aws-sdk';
// AWS.config.region = 'us-east-1';
const lambda = new AWS.Lambda();

invoke('serveless-puppeteer-dev-scraper', 'https://www.youtube.com/user/channel/videos', (data) => {
    const response = JSON.parse(data.Payload.toString());
    console.log(JSON.stringify(response, null, 2));
    const { body, statusCode: lambdaResponseStatusCode } = response;
    if (lambdaResponseStatusCode !== 200) {
        console.error(`Lambda Status = ${lambdaResponseStatusCode}`);
        return;
    }
    const urls = body.map(param => param?.queryStringParameters?.url);
    urls.map((url: string) => invoke('serveless-puppeteer-dev-clicker', url));
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
