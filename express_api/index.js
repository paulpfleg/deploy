const express = require('express');
const bodyParser = require("body-parser");
var XMLHttpRequest = require('xhr2');
const fs = require('fs');
const https = require('https');


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

    console.log(req)
//uses Data from Requestbody

    const {bitrate} = req.body;
    const {outputName} = req.body;
    const {outputFormat} = req.body;
    const {url} = req.body;
    const {filename} = req.body;
    const {codec} = req.body;
    const {width} = req.body;
    const {height} = req.body;
    

    console.log(req.body);

    //downloadFile(index)

    async () => {

    console.log(url)}


    const file = fs.createWriteStream(`${__dirname}/input/${filename}`);
    const request = https.get(`${url}`, function(response) {
   response.pipe(file);

   // after download completed close filestream
   file.on("finish", () => {
       file.close();
       console.log("Download Completed");

    

    try{  

        converted=Convert.convert(filename,bitrate,outputName,outputFormat,codec,width,height)
    
/*         res.send({
            status: "ok",
            convert: `Converted ${filename} with a bitrate of ${bitrate}`,
            executed: `${converted.ffmpeg_command}`
        }); */
        
    }catch (exception){
        res.send({
            status : "error",
            error_code: "001",
            error_message : "error catched when ffmpeg command was executed"
        })
    }
    

        s3Controller.s3Upload(`${__dirname}/output/${outputName}.${outputFormat}`,`${outputName}.${outputFormat}`)
            .then( (converted) => {
                fs.unlinkSync(`${__dirname}/output/${outputName}.${outputFormat}`);
                fs.unlinkSync(`${__dirname}/input/${filename}`);
                res.send({
                    status : "ok",
                    convert: `Converted ${filename} with a bitrate of ${bitrate}`,
                    executed: `${converted.ffmpeg_command}`
                })
            })
            .catch((response) => {
                res.send({
                    status : "error",
                    error_message : "upload error"
                })
            })

        //fs.unlinkSync(`${__dirname}/output/${outputName}.${outputFormat}`);

   });
});
    

});