const AWS = require('aws-sdk');
const config = require('config');

const s3 = new AWS.S3({
    accessKeyId:config.get('AWSAccessKeyId'),
    secretAccessKey:config.get('AWSSecretKey')
});

exports.s3 = s3;