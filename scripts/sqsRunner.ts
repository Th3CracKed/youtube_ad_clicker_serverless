require('dotenv').config()
import * as SQS from 'aws-sdk/clients/sqs';
const region = 'us-east-1';
const AWS_ACCOUNT = process.env.ACCOUNT_ID
const sqs = new SQS({ region });

const QUEUE_URL = `https://sqs.${region}.amazonaws.com/${AWS_ACCOUNT}/YoutubeQueue`;
const urls = [
    'https://youtube.com/watch?v=-dL8dVu1njc',
    'https://youtube.com/watch?v=adLbxJ1wCt0',
    'https://youtube.com/watch?v=peZ925r1-50',
    'https://youtube.com/watch?v=HaTdsKsHt3A',
    'https://youtube.com/watch?v=YCIGPMOmyDg',
    'https://youtube.com/watch?v=Px1ucuy1m3w',
    'https://youtube.com/watch?v=3T_qnnEbxpQ',
    'https://youtube.com/watch?v=QyO3MIKlWrU',
    'https://youtube.com/watch?v=BwuZsaIaJZs',
    'https://youtube.com/watch?v=TvoXUhFII_Y',
    'https://youtube.com/watch?v=Kr_0BEtO6nQ',
    'https://youtube.com/watch?v=q4wGZWgqg2I',
    'https://youtube.com/watch?v=6LWvru1Ealk',
    'https://youtube.com/watch?v=ZIj_iFXz6_4',
    'https://youtube.com/watch?v=phGewZlxNDU',
    'https://youtube.com/watch?v=-H1q6XU8uUU',
    'https://youtube.com/watch?v=0_wr58nTTRI',
    'https://youtube.com/watch?v=8mAECYnWox0',
    'https://youtube.com/watch?v=nlZrC4L1vCQ',
    'https://youtube.com/watch?v=sv4hg9FRG3g',
    'https://youtube.com/watch?v=1CFfM8nMMws',
    'https://youtube.com/watch?v=rpLz2acV7VQ',
    'https://youtube.com/watch?v=oK630tx4r1w',
    'https://youtube.com/watch?v=Emae3LZ7Bo8',
    'https://youtube.com/watch?v=tISSxwJuZYg',
    'https://youtube.com/watch?v=mPuPbuO8hVc',
    'https://youtube.com/watch?v=5lypxzcswXw',
    'https://youtube.com/watch?v=pR8PqM88ZB4',
    'https://youtube.com/watch?v=Kym98bxc3sI',
    'https://youtube.com/watch?v=pXEo-MYKsJQ'
];
(async function () {
    try {
        await Promise.all(urls.map(url => {
            const params = {
                MessageBody: url,
                QueueUrl: QUEUE_URL
            };
            return sqs.sendMessage(params, function (err, data) {
                if (err) {
                    console.log('error:', 'Fail Send Message ' + err);
                } else {
                    console.log('data:', data.MessageId);
                }
            }).promise();
        }));
    } catch (err) {
        console.log(err);
    }
    console.log('finished Successfully');
}())
