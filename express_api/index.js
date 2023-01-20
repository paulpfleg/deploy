const express = require('express');
const bodyParser = require("body-parser");
var XMLHttpRequest = require('xhr2');
const fs = require('fs');
const https = require('https');
const path_mod = require('path');

const { exec } = require('child_process');

const s3Controller = require('./src/s3-controller');
const wrapper = require('./ffmpeg_wrapper');


//express offeres middleware for handling of json
const app = express();
app.use(express.json());

//constant server port
const PORT = 8081;

var converted = {};


//enable bodyparser -> json to string
app.use(bodyParser.urlencoded({
    extended:true
}));

//launch server
app.listen( 
    PORT,
    ()=> console.log(`its alive on http://localhost:${PORT}`)
);

//request & respones objects
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
  });
 
// post endpoint for ffmpeg conversions
app.post('/convert/', (req,res) => {

    const {url}             = req.body;
    const {filename}        = req.body;

    var ffmpeg_convert = wrapper.createFFmpegString(req.body,filename);
    var still_to_send = true;

    console.log(req.body);
    console.log(ffmpeg_convert);

if (checkString(ffmpeg_convert.command)){
    //download file from s3
    const file = fs.createWriteStream(`${__dirname}/input/${filename}`);
    const request = https.get(`${url}`, function(response) {
        response.pipe(file); //after download completed close filestream
        file.on("finish", () => {

                try{
                    file.close();
                    console.log("Download Completed");
                }catch (exception){
                    still_to_send=sendresponse(3,res,still_to_send);
                }

                try{
                    //execute ffmpeg command in child process
                    exec(ffmpeg_convert.command, (error, stdout, stderr) => {
                        if (error) {
                            console.error(`error: ${error.message}`);
                            still_to_send=sendresponse(0,res,still_to_send,error.message)
                            return;
                        }

                        //logging of stderr -> contains mainly ffmpeg status codes
                        if (stderr) {
                            console.error(`stderr: ${stderr}`);
                            console.log("Upload has begun!")
                        }
                        stdout ? console.log(`stdout: ${stdout}`) : {};

                        //upload the file to S3 Bucket
                        s3Controller.s3Upload(`${__dirname}/output/${ffmpeg_convert.outputPath}`,`${ffmpeg_convert.outputPath}`,converted)
                        .then( (converted) => {
                            //if no responce was send to frontend jet to so with sucess message
                            if (still_to_send){ 
                                res.send({
                                    status : "ok",
                                    convert: `Converted ${filename} with an saved it as ${ffmpeg_convert.outputPath}`,
                                    executed: converted
                                    })
                            still_to_send = false
                            }
                            unlinkFiles(ffmpeg_convert.outputPath,filename,res);
                            }
                        )
                        .catch(() => {
                            still_to_send=sendresponse(1,res,still_to_send);
                        })
                    });
                }catch (exception){
                    // sends undefined error
                    still_to_send=sendresponse(5,res,still_to_send);
            }
            });
        });
    }
    else{
        still_to_send=sendresponse(4,res,still_to_send);
    }
});


//function to check the substring special characters, wich can change the ffmpeg commands behavior
function checkString(String){

    //array of permittet chars
    const checkfor = [";","$","#","&","\\","|",">","<","!","`","(",")"];

    for (var i = 0; i < checkfor.length; i++){
        if (String.includes(checkfor[i])){
            
            return false
        }
    }
    return true
}

//function to send the response for the processed request
function sendresponse(code,res,still_to_send,additional){
    //check if response was allready send
    if (still_to_send) {

        //arry with error codes
        const erroArray = ["ffmpeg command","file upload","local file deletation","file download","illegal sign"];
        const additional_info = additional;

        res.send({
            status : "error",
            error_code: `00${code}`,
            additional_info : `${additional_info}`,
            error_message : `${erroArray[code]} error`,
            
        })
        return false
    }
}

//function to remove processed files from local filesystem
function unlinkFiles(outputName,filename,ans) {
        console.log("Unlink has begun!");
        try{
            fs.unlinkSync(`${__dirname}/output/${outputName}`);
            fs.unlinkSync(`${__dirname}/input/${filename}`);
            return true
        }catch(exception){
            sendresponse(3,ans,false)
        }   
}

