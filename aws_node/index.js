const express = require('express');
const bodyParser = require("body-parser");
const request = require('request');
const ejs = require('ejs');
const path = require('path'); 
const { performance } = require('perf_hooks');
const fs = require('fs');
const {execSync} = require('child_process');

const app = express();
const s3Controller = require('./src/s3-controller');
const { timeStamp, time } = require('console');

//middleware logging function
app.use(logger)

app.set('views', path.join(__dirname, 'public'));

app.use(express.json())
//app.use(express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({
    extended:true
}));

app.set('view engine', 'ejs');

// --- Constands ---

const PORT = 8080;
const IP_backende = process.env.IP || "127.0.0.1"
const PORT_backend = 8081;


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

    console.log("--- Incomming request --- %j",req.body);
    console.log('---- TIME:' + stamp() );

    //var prove = sendRequest();
      call(req,res);
      execSync('sleep 1');
});

  //starts the node Server
  app.listen(PORT, () => {
    console.log(`its alive on http://localhost:${PORT}`);
  });


function sendRequest(options) {
  return new Promise((resolve, reject) => {

    request.post(options, (err, res, body) => {
      if (err) {
        res = {
          body : {
            error_message : "connection error"
          }
        }
        resolve(res);
      }
      else{
      console.log(`Status: ${res.statusCode}`);
      resolve(res);
      }
      
      
            
    })
  });
}

// Logger function mainly to showcase middleware
function logger (req,res,next) {
console.log("Site "+req.originalUrl+" has been requested")
next()
}

async function call(param1,param2) {

  const body = param1.body

  // maps req. parameters to new json object, to send it to the backend
  var options = {
    url: `http://${IP_backende}:${PORT_backend}/convert/`,
    json: true,
    body: {
      "bitrate":      body.bitrate,
      "outputName":   body.outputName,
      "outputFormat": body.outputFormat,
      "url":          body.url,
      "filename":     body.filename,
      "codec":        body.codec,
      "width":        body.width,
      "height":       body.height,
      "colourspace":  body.colourspace,
      "profile":      body.profile,
      "peaklum":      body.peaklum,
      "tonemap":      body.tonemap,
      "primaries":    body.primaries,
      "matrix":       body.matrix,
      "transfer":     body.transfer,
      "advanced_colour":body.advanced_colour
    }
  };

  var execTime = "";

    console.log("--- Out Going Request --- %j" , options.body);
    console.log("to %j  ---- TIME " + stamp(),  options.url);

    //get time, when request is send
    var startTime = performance.now();

    var prove = await sendRequest(options);
      
      console.log("Response: %j", prove.body);
      if (prove.body.status === "ok") {
        param2.sendFile(__dirname + '/public/sucess.html');
        logging();
        
      }
      else {
        param2.render('error.ejs', { error: prove.body.error_message });
        logging();
      }

      
      
      function logging(){
          var endTime = performance.now();
          execTime= `\n Current Time: ${stamp()} Execution time: ${endTime-startTime}; Status:${prove.body.error_message ? prove.body.error_message : prove.body.status}`;
          console.log(execTime);
          fs.appendFile("./logging/execution.txt",execTime, function(err) {
            if(err) {
                return console.log(err);
            }
        
            console.log("The file was saved!");
          }); 
      }




    
}

function stamp(){
  const dateObject = new Date();
  // current date
  // adjust 0 before single digit date
  const date = (`0 ${dateObject.getDate()}`).slice(-2);
   
  // current month
  const month = (`0 ${dateObject.getMonth() + 1}`).slice(-2);
   
  // current year
  const year = dateObject.getFullYear();
   
  // current hours
  const hours = dateObject.getHours();
   
  // current minutes
  const minutes = dateObject.getMinutes();

  return(`${hours}:${minutes}`)
}