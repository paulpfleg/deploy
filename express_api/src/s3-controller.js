const formidable = require('formidable');
const {uploadFileToS3, getBucketListFromS3, getPresignedURL} = require('./s3-service');

async function s3Upload (file_path,filename,converted) {
    try{
        await uploadFileToS3(file_path,filename, 'ffmpeg-node',()=>{
            Promise.resolve(converted)
        });
        
    } catch(ex) {
       // Promise.reject(err)
    }
}

async function s3Get (req, res) {
    try{
        const bucketData = await getBucketListFromS3('ffmpeg-node');
        const {Contents = []} = bucketData; 
        res.send(Contents.map(content => {
        return {
            key: content.Key,
            size: (content.Size/1024).toFixed(1) + ' KB',
            lastModified: content.LastModified
        }
    }));
    } catch(ex) {
        res.send([]);
    }
}

module.exports = {
    s3Upload,
    s3Get,
}
