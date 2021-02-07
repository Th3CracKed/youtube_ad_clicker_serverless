import 'source-map-support/register';

import { formatErrorJSONResponse } from '@libs/apiGateway';
import { formatSuccessJSONResponse } from '@libs/apiGateway';

import { Browser } from 'puppeteer';
import { waitForNavigation } from '../../helper';
import { createHandler } from '../wrapper';
import * as any from 'promise.any';

const clicker = async (browser: Browser, url: string) => {
  console.log('Clicker started...');
  const page = await browser.newPage();
  let clickedSelector: string; 
  try {
    console.log(`Visiting ${url}`);
    await page.goto(url);
    console.log(`${url} loaded Successfully`);
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
    await waitForNavigation(page, 20000, ...selectors);
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

export const main = createHandler(clicker);
