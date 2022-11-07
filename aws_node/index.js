const express = require('express');
const bodyParser = require("body-parser");
const request = require('request');
const ejs = require('ejs');

const app = express();
const s3Controller = require('./src/s3-controller');

//middleware logging function
app.use(logger)

app.use(express.json())
//app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({
    extended:true
}));

app.set('view engine', 'ejs');

// --- Constands ---

const PORT = 8080;
const PATH_FFMPEG = "http://localhost:8080/convert/1"


// --- Get Endpoints for Front End ---

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/files', (req, res) => {
    res.sendFile(__dirname + '/public/files.html');
});

app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/public/about.html')
});

// // --- Endpoits for Functions ---

app.post('/upload-to-s3', s3Controller.s3Upload);

app.post('/delete-from-s3', s3Controller.s3Delete);

app.get('/all-files', s3Controller.s3Get);

app.get('/get-object-url/:key', s3Controller.getSignedUrl);

app.post('/parameters', function(req,res){

    console.log(req.body);

    const options = {
      url: 'http://localhost:8081/convert/',
      json: true,
      body: {
      "bitrate": req.body.bitrate,
      "outputName": req.body.outputName,
      "outputFormat": req.body.outputFormat,
      "url": req.body.url,
      "filename": req.body.filename,
      "codec": req.body.codec,
      "width":req.body.width,
      "height":req.body.height
      }     
    }
    

    var prove = sendRequest(options);

    (async () => {
      var prove = await sendRequest(options);
      if (prove.body.status === "ok"){
        console.log("Response: %j", prove.body );
        res.sendFile(__dirname + '/public/sucess.html')
      }
      else {
        res.render('error.ejs')
      }
    })()
  
    console.log("Send Convert params to FFMPEG node");
    
   
   
});

async function postParam(options) {
  const res = await sendRequest(options).catch(err => console.log(err));
  return await res
}

function sendRequest(options) {
  return new Promise((resolve, reject) => {

    request.post(options, (err, res, body) => {
      
      if (err) {
        return console.log(err)
      }
      console.log(`Status: ${res.statusCode}`);
      
      resolve(res);
            
    })
  });
}

app.listen(PORT, () => {
    console.log(`its alive on http://localhost:${PORT}`);
});

// Logger function mainly to showcase middleware
function logger (req,res,next) {
console.log("Site "+req.originalUrl+" has been requested")
next()
}