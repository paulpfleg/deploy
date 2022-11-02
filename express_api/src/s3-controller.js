const formidable = require('formidable');
const {uploadFileToS3, getBucketListFromS3, getPresignedURL} = require('./s3-service');

async function s3Upload (file_path,filename) {
    try{
        await uploadFileToS3(file_path,filename, 'ffmpeg-node');
        return('Uploaded!!');
    } catch(ex) {
        return(ex);
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

async function readFormData(req) {
    return new Promise(resolve => {
        const dataObj = {};
        var form = new formidable.IncomingForm();
        form.parse(req);

        form.on('file', (name, file) => {
            dataObj.name = name;
            dataObj.file = file;
        });

        form.on('end', () => {
            resolve(dataObj);
        });
    });
}

async function getSignedUrl(Key) {
    try {
        const {key} = Key;
        const url = await getPresignedURL('ffmpeg-node', key);
        return url;

    } catch(ex) {
        return('');
    }
}

module.exports = {
    s3Upload,
    s3Get,
    getSignedUrl
}
