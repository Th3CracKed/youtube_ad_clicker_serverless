import type { AWS } from '@serverless/typescript';

let skeleton: AWS;

type Function = typeof skeleton.functions.anything

const clickerFn: Function = {
  handler: `${__dirname.split(process.cwd())[1].substring(1).replace(/\\/g, '/')}/handler.main`,
  maximumRetryAttempts: 0,
  events: [
    {
      http: {
        method: 'get',
        path: 'clicker'
      }
    },
    {
      sqs: {
        arn: {
          'Fn::GetAtt': [
            'YoutubeQueue',
            'Arn'
          ],
        },
        batchSize: 1
      }
    }
  ],
} 
export default clickerFn;