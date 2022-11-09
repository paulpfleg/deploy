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

    console.log(req.body);

    //var prove = sendRequest();
    call(req,res);
   
   
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

app.listen(PORT, () => {
    console.log(`its alive on http://localhost:${PORT}`);
});

// Logger function mainly to showcase middleware
function logger (req,res,next) {
console.log("Site "+req.originalUrl+" has been requested")
next()
}

async function call(param1,param2) {
  var options = {
    url: `http://${IP_backende}:${PORT_backend}/convert/`,
    json: true,
    body: {
      "bitrate": param1.body.bitrate,
      "outputName": param1.body.outputName,
      "outputFormat": param1.body.outputFormat,
      "url": param1.body.url,
      "filename": param1.body.filename,
      "codec": param1.body.codec,
      "width": param1.body.width,
      "height": param1.body.height,
      "colourspace":param1.body.colourspace
    }
  };

      var prove = await sendRequest(options);
      console.log("Response: %j", prove.body);
      if (prove.body.status === "ok") {
        param2.sendFile(__dirname + '/public/sucess.html');
      }
      else {
        param2.render('error.ejs', { error: prove.body.error_message });
      }

}