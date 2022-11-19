const AWS = require('aws-sdk');
const fs = require('fs');

function createS3Instance() {
    var test = process.env.AWSAccessKeyId;
    const s3 = new AWS.S3({
        credentials: {
            accessKeyId: process.env.AWSAccessKeyId,
            secretAccessKey: process.env.AWSSecretKey,
        },
        region: 'eu-central-1'
    });
    return s3;
}

async function uploadFileToS3(path,filename, bucketName) {
    const s3 = createS3Instance();
    const fileStream = fs.createReadStream(path);
    const params = {
        Body: fileStream,
        Bucket: bucketName,
        Key: filename
    }
    const uploadData = await s3.upload(params).promise();
    return uploadData;
}

module.exports = {
    uploadFileToS3,
}