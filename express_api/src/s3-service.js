const AWS = require('aws-sdk');
const fs = require('fs');

// -- module uses AWS SDK functions, to upload files


//cretates new S3 object, provides credentials handed over by service files
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

//uploads files asyn. using s3 instance provided by aboth 
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