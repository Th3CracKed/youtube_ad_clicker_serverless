import { formatErrorJSONResponse, formatInternalErrorJSONResponse } from "@libs/apiGateway";
import { APIGatewayEvent } from "aws-lambda";
import { Browser } from "puppeteer";
import { APIResponse, getChrome } from "src/utils";

export const createHandler = (
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
        return response;
    } catch (err) {
        return formatInternalErrorJSONResponse({ msg: "Unhandled Error", err });
    }
}