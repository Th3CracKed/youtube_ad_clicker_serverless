import 'source-map-support/register';

import { formatErrorJSONResponse, formatInternalErrorJSONResponse } from '@libs/apiGateway';
import { formatSuccessJSONResponse } from '@libs/apiGateway';

import { Browser } from 'puppeteer';
import { APIGatewayEvent } from 'aws-lambda';
import { APIResponse, getChrome } from 'src/utils';

const scraper = async (browser: Browser, url: string) => {
  console.log('Scraping started...');
  try {
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
    const output = urls.map(url => ({
      queryStringParameters: {
        url
      }
    }));
    page.close();
    return formatSuccessJSONResponse(output);
  } catch (err) {
    return formatErrorJSONResponse({ err });
  }
}

const createHandler = (
  workFunction: (browser: Browser, url: string) => Promise<APIResponse>
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
    const response = await workFunction(browser, url);
    return nbOfExecutionWrapper(response, nbOfExecution);
  } catch (err) {
    return formatInternalErrorJSONResponse({ msg: "Unhandled Error", err });
  }
}

function nbOfExecutionWrapper(response: APIResponse, nbOfExecution: number) {
  const { body, statusCode } = response;
  if (statusCode === 200 && Array.isArray(body)) {
    response.body = Array(nbOfExecution).fill(body).flat();
  }
  return response;
}

export const main = createHandler(scraper);
