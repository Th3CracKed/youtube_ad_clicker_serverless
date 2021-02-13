import 'source-map-support/register';

import { formatErrorJSONResponse, formatInternalErrorJSONResponse, formatSuccessJSONResponse } from '@libs/apiGateway';

import { Browser } from 'puppeteer';
import { APIGatewayEvent } from 'aws-lambda';
import { APIResponse, getChrome } from 'src/utils';
import * as SQS from 'aws-sdk/clients/sqs';


const scraper = async (browser: Browser, url: string): Promise<string[]> => {
  console.log('Scraping started...');
  const page = await browser.newPage();
  console.log(`Visiting ${url}`);
  await page.goto(url, { waitUntil: 'networkidle0' });
  page.setCookie(
    { name: 'CONSENT', value: 'YES+FR.en+V9+BX', domain: '.youtube.com' },
    { name: 'CONSENT', value: 'YES+FR.en+V9+BX', domain: 'www.youtube.com' },
  );
  console.log(`${url} loaded Successfully`);
  const urls = await page.$$eval('#video-title', (videos) => videos.map(video => 'https://youtube.com' + video.getAttribute('href')));
  console.log(urls);
  page.close();
  return urls;
}

const createHandler = (
  workFunction: (browser: Browser, url: string) => Promise<string[]>
) => async (event: APIGatewayEvent): Promise<APIResponse> => {
  const url = event?.queryStringParameters?.url;
  const nbOfExecution = Number(event?.queryStringParameters?.nbOfExecution) || 1;
  if (!url) {
    return formatErrorJSONResponse("Please provide a ?url= parameter");
  }
  const browser = await getChrome();
  if (!browser) {
    return formatInternalErrorJSONResponse("Error launching Chrome");
  }
  try {
    const urls = await workFunction(browser, url);
    const { sqs, QueueUrl } = getSQSInfo();
    const duplicatedUrls = Array<string[]>(nbOfExecution).fill(urls).flat();
    await Promise.all(duplicatedUrls.map(async url => sendToSQS(sqs, QueueUrl, url)));
    await browser.close();
    return formatSuccessJSONResponse(duplicatedUrls);
  } catch (err) {
    return formatInternalErrorJSONResponse({ err });
  }
}

function sendToSQS(sqs: SQS, QueueUrl: string, url: string) {
  const params = {
    MessageBody: url,
    QueueUrl
  };
  const streamResponse = sqs.sendMessage(params, function (err, data) {
    if (err) {
      console.log('error:', 'Fail Send Message' + err);
    } else {
      console.log('data:', data.MessageId);
    }
  });
  return streamResponse.promise();
}

function getSQSInfo() {
  const region = 'us-east-1';
  const AWS_ACCOUNT = process.env.ACCOUNT_ID;
  console.log('AWS_ACCOUNT', AWS_ACCOUNT);
  const sqs = new SQS({ region });

  const QueueUrl = `https://sqs.${region}.amazonaws.com/${AWS_ACCOUNT}/YoutubeQueue`;
  return { sqs, QueueUrl };
}

export const main = createHandler(scraper);
