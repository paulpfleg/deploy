const { request } = require('express');
const formidable = require('formidable');
const {deleteFilefromS3, uploadFileToS3, getBucketListFromS3, getPresignedURL} = require('./s3-service');

const path_mod = require('path');


// -- the file provides functions to adjust in- / out-puts of aws sdk and handel common errors


// async call to upload function in s3-service file
// gets the form data containing the file from 
async function s3Upload (req, res) {
    const formData = await readFormData(req);
    try{
        await uploadFileToS3(formData.file, 'ffmpeg-node');
        res.send('Uploaded!!');
    } catch(ex) {
        res.send('ERROR!!!!');
    }
}

// handles form data containing incomming file
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


//async call for file deletation incl. some logging
async function s3Delete (req, res) {
    
    try{
        console.log(req.body);
        const {filename} = req.body;

        console.log(filename)
        await deleteFilefromS3(filename, 'ffmpeg-node');
        
        res.sendFile(path_mod.join(__dirname, '..', '/public/files.html'));
    } catch(ex) {
        res.send('ERROR!!!!');
    }
}

//same as aboth returns a list objects containing the infos below
async function s3Get (req, res) {

    function sendRes(Contents) {        
            
        res.send(Contents.map(content => {
        return {
            key: content.Key ,
            size: (content.Size/1024).toFixed(1) + ' KB',
            lastModified: content.LastModified
        }}
        ))
    }

    try{
        const bucketData = await getBucketListFromS3('ffmpeg-node');
        var {Contents = []} = bucketData; 

        return sendRes(Contents);

    } catch(ex) {
        Contents = [{Key: 'Error', LastModified: 'S3 not Reachable', Size: 0}]
        sendRes(Contents)
    }
}

async function getSignedUrl(req, res) {
    try {
        const {key} = req.params;
        const url = await getPresignedURL('ffmpeg-node', key);
        res.send(url);

    } catch(ex) {
        res.send('');
    }
}

module.exports = {
    s3Upload,
    s3Get,
    getSignedUrl,
    s3Delete
}
