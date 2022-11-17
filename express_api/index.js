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
    const {bitrate} = req.body;
    const {outputName} = req.body;
    const {outputFormat} = req.body;
    const {url} = req.body;
    const {filename} = req.body;
    const {codec} = req.body;
    const {width} = req.body;
    const {height} = req.body;
    const {colourspace} = req.body;
    const {profile} = req.body;

    fileToConvert = path_mod.join(__dirname, 'input', `${filename}`);
    outputPath = path_mod.join(__dirname, 'output'); 

    const ffmpeg_convert = `ffmpeg -y \
    -i ${fileToConvert} \
    ${bitrate ? `-b:v ${bitrate}M` : ``} \
    ${codec ? `-c:v ${codec}` : ``} \
    ${profile ? `-profile ${profile}` : ``} \
    ${(width && height) ? `-vf scale=${width}:${height}` : ``} \
    ${colourspace ? `-vf "colorspace=${colourspace}"` : ``} \
    -movflags use_metadata_tags -map_metadata 0 \
    ${outputName ? `${outputPath}/${outputName}.${outputFormat}` : `${outputPath}/video.${outputFormat}`} \
     `

    console.log(req.body);
    console.log(ffmpeg_convert);

    const file = fs.createWriteStream(`${__dirname}/input/${filename}`);
    const request = https.get(`${url}`, function(response) {
        response.pipe(file);
        // after download completed close filestream
        file.on("finish", () => {

            try{
                file.close();
                console.log("Download Completed");
            }catch (exception){
                res.send({
                    status : "error",
                    error_code: "005",
                    error_message : "file download error"
                })
            }

            try{
                exec(ffmpeg_convert, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`error: ${error.message}`);
                        return;
                    }

                    if (stderr) {
                        console.error(`stderr: ${stderr}`);
                    }

                    s3Controller.s3Upload(`${__dirname}/output/${outputName}.${outputFormat}`,`${outputName}.${outputFormat}`,converted)
                    .then( (converted) => {
                        console.log("Upload has begun!--")
                        res.send({
                            status : "ok",
                            convert: `Converted ${filename} with a bitrate of ${bitrate}`,
                            executed: converted
                            })
                        unlinkFiles(outputName,outputFormat,filename,res);
                        }
                        
                    )
                    .catch(() => {
                        res.send({
                            status : "error",
                            error_code: "002",
                            error_message : "file upload error"
                        })
                        if    (!unlinkFiles(outputName,outputFormat,filename)){
                            res.send({
                                status : "error",
                                error_code: "003",
                                error_message : "local file deletation error"
                            })
                        };
                   
                    })

                    
                });

            }catch (exception){
                res.send({
                    status : "error",
                    error_code: "001",
                    error_message : "ffmpeg command error"
                })
            }
        });
    });
});

function unlinkFiles(name,format,filename,ans) {
        console.log("Unnlink has begun!")
        try{
            fs.unlinkSync(`${__dirname}/output/${name}.${format}`);
            fs.unlinkSync(`${__dirname}/input/${filename}`);
            return true
        }catch(exception){
            return false
        }   
}