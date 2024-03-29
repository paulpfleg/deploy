const AWS = require('aws-sdk');
const fs = require('fs');

// build S3 object for further use in other functions
function createS3Instance() {
    const s3 = new AWS.S3({
        credentials: {
            //credentials for bucket ar handed over by enviroment vars
            //rather by system ctl or execution params
            accessKeyId: process.env.AWSAccessKeyId,
            secretAccessKey: process.env.AWSSecretKey,
        },
        region: 'eu-central-1'
    });
    return s3;
}

async function uploadFileToS3(fileObj, bucketName) {
    const s3 = createS3Instance();
    const fileStream = fs.createReadStream(fileObj.filepath);
    const params = {
        Body: fileStream,
        Bucket: bucketName,
        Key: fileObj.originalFilename
    }
    const uploadData = await s3.upload(params).promise();
    return uploadData;
}

// gets content of S3 bucket
//bucketName is the unique identifier of the Bucket
async function getBucketListFromS3(bucketName) {
    //creates S3 object via SDK
    const s3 = createS3Instance();
    const params = {
        Bucket: bucketName,
        MaxKeys: 10
    }

    const bucketData = s3.listObjects(params).promise();
    return bucketData || {};
}

// Delete File from S3
async function deleteFilefromS3 (filename, bucketName){
    console.log(filename);
    try{
    const s3 = createS3Instance();
    await s3.deleteObject({ Bucket: bucketName, Key: filename }).promise()
    } catch(error){
        return { success: false, data: null }
    }
}



//creates a presigned URL to restrickt Acess
async function getPresignedURL(bucketName, key) {
    const s3 = createS3Instance();
    const params = {
        Bucket: bucketName,
        Key: key,
        Expires: 60
    }

    const preSignedURL = await s3.getSignedUrl('getObject', params);
    return preSignedURL;
}

module.exports = {
    uploadFileToS3,
    getBucketListFromS3,
    getPresignedURL,
    deleteFilefromS3
}