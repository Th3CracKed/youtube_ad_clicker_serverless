import * as chrome from "chrome-aws-lambda"

export type APIResponse = {
  statusCode: number
  headers?: { [key: string]: string }
  body: string | Buffer | Record<string, unknown>
  isBase64Encoded?: boolean
}

export async function getChrome() {
  let browser = null

  try {
    browser = await chrome.puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
      ignoreHTTPSErrors: true,
    })
  } catch (err) {
    console.error("Error launching chrome")
    console.error(err)
  }

  return browser
}

export async function findAsync<T>(array: T[], predicate: (value: T, index?: number, obj?: T[]) => Promise<boolean>): Promise<T> {
  const candidates = await Promise.all(array.map(predicate));
  const index = candidates.findIndex(candidate => candidate);
  return array[index];
}

export function chainAllTasksInSeries<T>(tasksFactory: (() => Promise<T>)[]): Promise<T[]> {
  return tasksFactory.reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults =>
      currentTask().then(currentResult =>
        [...chainResults, currentResult]
      )
    );
  }, Promise.resolve([]));
}
