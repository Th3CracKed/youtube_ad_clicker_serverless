import 'source-map-support/register';

import { formatErrorJSONResponse } from '@libs/apiGateway';
import { formatSuccessJSONResponse } from '@libs/apiGateway';

import { Browser } from 'puppeteer';
import { createHandler } from 'src/functions/wrapper';

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
    page.close();
    return formatSuccessJSONResponse({ urls });
  } catch (err) {
    return formatErrorJSONResponse({ err });
  }
}

export const main = createHandler(scraper);
