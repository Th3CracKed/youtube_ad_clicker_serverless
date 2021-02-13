import type { AWS } from '@serverless/typescript';

import { scraper, clicker, scraperToQueue } from './src/functions';

const serverlessConfiguration: AWS = {
  service: 'serveless-puppeteer',
  frameworkVersion: '2',
  custom: {
    webpack: {
      webpackConfig: './webpack.config.js',
      includeModules: true
    }
  },
  plugins: ['serverless-webpack', 'serverless-offline'],
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
      ACCOUNT_ID: '${opt:ACCOUNT_ID}'
    },
    lambdaHashingVersion: '20201221',
    timeout: 240,
    region: 'us-east-1',
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
          'sqs:SendMessage'
        ],
        Resource: 'arn:aws:sqs:${self:provider.region}:*:YoutubeQueue'
      }
    ]
  },
  functions: { clicker, scraper, scraperToQueue },
  package: {
    exclude: ['node_modules/puppeteer/.local-chromium/**']
  },
  resources: {
    Resources: {
      YoutubeQueue: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: 'YoutubeQueue',
          VisibilityTimeout: 240
        }
      }
    }
  }
}

module.exports = serverlessConfiguration;
