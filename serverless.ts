import type { AWS } from '@serverless/typescript';

import { scraper, clicker } from './src/functions';

const serverlessConfiguration: AWS = {
  service: 'serveless-puppeteer',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    apiGateway: {
      binaryMediaTypes: ['*/*'],
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    lambdaHashingVersion: '20201221',
    timeout: 120
  },
  functions: { scraper, clicker },
  package: {
    exclude: ['node_modules/puppeteer/.local-chromium/**']
  }
}

module.exports = serverlessConfiguration;
