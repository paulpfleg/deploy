const express = require('express');
const bodyParser = require("body-parser");
var XMLHttpRequest = require('xhr2');
const fs = require('fs');
const https = require('https');
const path_mod = require('path');

const { exec } = require('child_process');


const s3Controller = require('./src/s3-controller');
const Convert = require('./src/convert');

//express offeres middleware for handling of json
const app = express();
const PORT = 8081;

var converted = {};

app.use(express.json())

app.use(bodyParser.urlencoded({
    extended:true
}));

app.listen( 
    PORT,
    ()=> console.log(`its alive on http://localhost:${PORT}`)

);

let list = [];


 //request & respones objects
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
  });
  
//Test to build response file
app.post("/", function(req, res) {
    var num1 = Number(req.body.input_video);
    
    res.sendFile(__dirname + "/result.html");
  });

  // POST Request
app.post('/convert/', (req,res) => {


    

//uses Data from Requestbody
    const {bitrate}         = req.body;
    const {outputName}      = req.body;
    const {outputFormat}    = req.body;
    const {url}             = req.body;
    const {filename}        = req.body;
    const {codec}           = req.body;
    const {width}           = req.body;
    const {height}          = req.body;
    const {colourspace}     = req.body;
    const {profile}         = req.body;
    const {peaklum}         = req.body;
    const {tonemap}         = req.body;
    const {primaries}       = req.body;
    const {matrix}         = req.body;
    const {transfer}        = req.body;
    const {advanced_colour}= req.body;
    


    const fileToConvert = path_mod.join(__dirname, 'input', `${filename}`);
    const outputPath = path_mod.join(__dirname, 'output'); 

    var colour_string = '';

    if (advanced_colour) {
        colour_string = `-vf zscale=t=linear:npl=${peaklum},\
format=gbrpf32le,zscale=p=${primaries},tonemap=tonemap=${tonemap}:desat=0,\
zscale=t=${transfer}:m=${matrix}:r=tv,format=yuv420p`
        console.log("Colour String: "+colour_string)
    } 
    
    const ffmpeg_convert = `ffmpeg -y \
-i ${fileToConvert} ${colour_string} \
${bitrate ? `-b:v ${bitrate}M` : ``} \
${codec ? `-c:v ${codec}` : ``} \
${profile ? `-profile ${profile}` : ``} \
${(width && height) ? `-vf scale=${width}:${height}` : ``} \
${colourspace ? `-vf "colorspace=${colourspace}"` : ``} \
-movflags use_metadata_tags -map_metadata 0 \
${outputName ? `${outputPath}/${outputName}.${outputFormat}` : `${outputPath}/video.${outputFormat}`}`

    var still_to_send = true;

    console.log(req.body);
    console.log(ffmpeg_convert);

if (checkString(ffmpeg_convert)){
    const file = fs.createWriteStream(`${__dirname}/input/${filename}`);
    const request = https.get(`${url}`, function(response) {
        response.pipe(file);
        // after download completed close filestream
        file.on("finish", () => {

            try{
                file.close();
                console.log("Download Completed");
            }catch (exception){
                still_to_send=sendresponse(4,res,still_to_send);
            }

            try{
                exec(ffmpeg_convert, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`error: ${error.message}`);
                        still_to_send=sendresponse(1,res,still_to_send)
                        return;
                    }

                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                        console.log("Upload has begun!")
                    }

                    stdout ? console.error(`stdout: ${stdout}`) : {};

                    s3Controller.s3Upload(`${__dirname}/output/${outputName}.${outputFormat}`,`${outputName}.${outputFormat}`,converted)
                    .then( (converted) => {
                        
                        if (still_to_send){ 
                            res.send({
                                status : "ok",
                                convert: `Converted ${filename} with a bitrate of ${bitrate}`,
                                executed: converted
                                })
                        still_to_send = false
                        }

                        unlinkFiles(outputName,outputFormat,filename,res);
                        }
                        
                    )
                    .catch(() => {
                        still_to_send=sendresponse(2,res,still_to_send);
                 
                    })
       
                });

            }catch (exception){
                still_to_send=sendresponse(1,res,still_to_send);
            }
        });
    });
 }
});

function checkString(String){

    const checkfor = [";","$","#","&","\\"];

    for (var i = 0; i < checkfor.length; i++){
        if (String.includes(checkfor[i])){
            
            return false
        }
    }
    return true
}

function sendresponse(code,res,still_to_send){
    if (still_to_send) {
        const erroArray = ["ffmpeg command","file upload","local file deletation","file download","illegal sign"]
        res.send({
            status : "error",
            error_code: `00${code}`,
            error_message : `${erroArray[code]} error`
        })
        return false
    }
}

function unlinkFiles(name,format,filename,ans) {
        console.log("Unlink has begun!")
        try{
            fs.unlinkSync(`${__dirname}/output/${name}.${format}`);
            fs.unlinkSync(`${__dirname}/input/${filename}`);
            return true
        }catch(exception){
            sendresponse(3,ans,false)
        }   
}
