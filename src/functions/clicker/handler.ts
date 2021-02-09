import 'source-map-support/register';

import { formatErrorJSONResponse, formatInternalErrorJSONResponse } from '@libs/apiGateway';
import { formatSuccessJSONResponse } from '@libs/apiGateway';

import { Browser, Page } from 'puppeteer';
import { waitForNavigation } from '../../helper';
import * as any from 'promise.any';
import { APIGatewayEvent } from 'aws-lambda';
import { APIResponse, getChrome } from 'src/utils';

const clicker = async (browser: Browser, url: string) => {
  console.log('Clicker started...');
  const page = await browser.newPage();
  let clickedSelector: string;
  try {
    console.log(`Visiting ${url}`);
    await page.goto(url);
    console.log(`${url} loaded Successfully`);
    await clickOnConfirmationDialog({ page, url });
    console.log(`playing Video...`);
    await page.keyboard.press('k');
    const playButton = await page.$('button[aria-label="Play (k)"]');
    playButton?.click();
    console.log(`Video Played`);
    const selectors = [
      '[id^="visit-advertiser"]',
      '[id^="invideo-overlay"]',
      '#action-companion-click-target',
      '.ytp-ad-overlay-title'
      // TODO support more ads type
    ];
    console.log(`Waiting for selectors...`);
    await waitForNavigation(page, 120000, ...selectors);
    console.log(`A selector is found !`);
    clickedSelector = await any(selectors.map(async selector => {
      await page.click(selector);
      return `${selector} clicked`;
    }));
    console.log(`${clickedSelector} selector is clicked`);
  } catch (err) {
    console.log(err);
    return formatErrorJSONResponse({ err });
  } finally {
    await page.waitForTimeout(2000); // wait for ads click to count
    page.close();
    return formatSuccessJSONResponse({ clickedSelector });
  }
}

const createHandler = (
  workFunction: (browser: Browser, url: string) => Promise<APIResponse>
) => async (event: APIGatewayEvent): Promise<APIResponse> => {
  const url = event?.queryStringParameters?.url;
  if (!url) {
    return formatErrorJSONResponse("Please provide a ?url= parameter");
  }
  const browser = await getChrome();
  if (!browser) {
    return formatInternalErrorJSONResponse("Error launching Chrome");
  }
  try {
    const response = await workFunction(browser, url);
    await browser.close();
    return response;
  } catch (err) {
    await browser.close();
    return formatInternalErrorJSONResponse({ msg: "Unhandled Error", err });
  }
}

export const main = createHandler(clicker);

async function clickOnConfirmationDialog({ page, url }: { page: Page; url: string; }) {
  try {
    console.log(`Clicking on thanks button...`);
    await waitForNavigation(page, 10000, 'paper-button[aria-label="No thanks"]');
    await page.click('paper-button[aria-label="No thanks"]', { delay: 200 });
    console.log(`Thanks button Clicked !`);
    await page.waitForTimeout(2000); // wait for ajax request
    await waitForNavigation(page, 10000, '#consent-bump');
    const consentUrl: string = await page.evaluate(() => {
      const dialog: any = document.querySelector('#consent-bump');
      return dialog.iframe.src;
    });
    await page.goto(consentUrl);
    await waitForNavigation(page, 10000, '#introAgreeButton');
    await page.click('#introAgreeButton');
    await page.waitForTimeout(2000); // wait for ajax request
    await page.goto(url);
  } catch (err) {
    console.log(err);
    console.log('Couldn\'t find the thanks button');
  }
}
