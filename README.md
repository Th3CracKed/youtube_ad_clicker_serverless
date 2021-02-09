# Serverless - Youtube ad clicker

- This project is created for learning purposes. Using it is against the Youtube terms.  

## Installation/deployment instructions

Depending on your preferred package manager, follow the instructions below to deploy your project.

> **Requirements**: NodeJS `lts/erbium (v.12.19.0)`. If you're using [nvm](https://github.com/nvm-sh/nvm), run `nvm use` to ensure you're using the same Node version in local and in your lambda's runtime.

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx sls deploy` to deploy this stack to AWS

### Using Yarn

- Run `yarn` to install the project dependencies
- Run `yarn sls deploy` to deploy this stack to AWS

## Test your service

This project contains a two lambda functions triggered by an HTTP request made on the provisioned API Gateway REST API `/scraper` route with `GET` method and `/clicker` route with `GET` method. The request must include a `url` **param** like `/scraper?url=https://www.youtube.com/c/channelName/videos`.

The `/scraper` Endpoint support an optional `nbOfExecution` **param** to duplicates the scraped urls as needed

- requesting any other path than `/scraper` or `/clicker` with any other method than `GET` will result in API Gateway returning a `403` HTTP error code
- sending a `GET` request to `/scraper` or `/clicker` without a `url` **param** 
- sending a `GET` request to `/scraper` or `/clicker` with a `url` **param** will result in API Gateway returning a `200` HTTP status code with a body message containing the lambda response. For the `/scraper` endpoint the response is the last 30 videos urls (if available), For the `/clicker` endpoint the response is the clicked ad selector id or empty body in case the ad was not clicked. 

> :warning: As is, once deployed, opens a **public** endpoint within your AWS account resources. Anybody with the URL can actively execute the API Gateway endpoint and the corresponding lambda. You should protect this endpoint with the authentication method of your choice.

### Locally

In order to test the functions locally, update `mock.json` with the Youtube url, then run the following command:

- `npm run scraper` to scrape channel urls
- `npm run clicker` to click ads on youtube videos

Check the [sls invoke local command documentation](https://www.serverless.com/framework/docs/providers/aws/cli-reference/invoke-local/) for more information.

### Remotely

Copy and replace your `url` - found in Serverless `deploy` command output - and `url` parameter in the following `curl` command in your terminal or in Postman to test your newly deployed application.

```
curl --location --request GET 'https://myApiEndpoint/dev/scraper?url=https://www.youtube.com/c/channelName/videos' \
curl --location --request GET 'https://myApiEndpoint/dev/clicker?url=https://www.youtube.com/watch?v=video_id' \
```

# Step functions

- This project include a step functions template to connect the two lambdas, make sure you change the arn to Yours.

# Local Script

- `$ npm run start -- --url https://www.youtube.com/user/channelName/videos --nbOfExecution 2` to run a cli to invoke the lambdas via aws sdk.  

## Template features

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas

```
.
├── src
│   ├── functions            # Lambda configuration and source code folder
│   │   ├── scraper
│   │   │   ├── handler.ts   # `Scraper` lambda source code
│   │   │   ├── index.ts     # `Scraper` lambda Serverless configuration
│   │   │   └── mock.json    # `Scraper` lambda input parameter, if any, for local invocation
│   │   ├── clicker
│   │   │   ├── handler.ts   # `Clicker` lambda source code
│   │   │   ├── index.ts     # `Clicker` lambda Serverless configuration
│   │   │   └── mock.json    # `Clicker` lambda input parameter, if any, for local invocation
│   │   │
│   │   └── index.ts         # Import/export of all lambda configurations
│   │
│   └── libs                 # Lambda shared code
│       └── apiGateway.ts    # API Gateway specific helpers
│
├── package.json
├── serverless.ts            # Serverless service file
├── tsconfig.json            # Typescript compiler configuration
└── webpack.config.js        # Webpack configuration
```

### 3rd party librairies

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) - uses JSON-Schema definitions used by API Gateway for HTTP request validation to statically generate TypeScript types in your lambda's handler code base
- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file
