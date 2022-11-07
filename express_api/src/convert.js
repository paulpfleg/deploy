

//process to call ffmpeg
//import child_process from 'child_process';

const child_process = require('child_process');
const { path } = require('express/lib/application');


//import the JS Filesystem
const fs = require('fs');
const path_mod = require('path');

function convert(filename,bitrate,outputName,outputFormat,codec,width,height){        
    try {

      // if no path entered or no path exists at path exit without outputs

      fileToConvert = path_mod.join(__dirname, '..', 'input', `${filename}`)
      outputPath = path_mod.join(__dirname, '..', 'output')

      if (!filename || (filename && !fs.existsSync(fileToConvert))) {
        console.warn('\nVideofile does not exist on Convert Node!\n');}

        const ffmpeg_command = `./bin/ffmpeg -y \
            -i ${fileToConvert} \
            ${bitrate ? `-b:v ${bitrate}M` : ``} \
            ${codec ? `-c:v ${codec}` : ``} \
            ${(width && height) ? `-vf scale=${width}:${height}` : ``} \
            ${outputName ? `${outputPath}/${outputName}.${outputFormat}` : `${outputPath}/video.${outputFormat}`}
             `
        
        
        child_process.execSync(ffmpeg_command), {

            stdio: Object.values({
            //how to handle the input/output of the child pocess
            //just handle same as main
            stdin: 'inherit',
            stdout: 'inherit',
            stderr: 'inherit',
              })
            };

            child_process.execSync(`./bin/ffprobe -v quiet -select_streams v:0 -show_entries stream=bit_rate -of default=noprint_wrappers=1 ${outputPath}/${outputName}.${outputFormat}`, {
                stdio: Object.values({
                //how to handle the input/output of the child pocess
                //just handle same as main
                stdin: 'inherit',
                stdout: 'inherit',
                stderr: 'inherit',
                  })
            });

            return({ ffmpeg_command : ffmpeg_command, path : outputPath});

    } catch (exception) {
            console.warn(exception.message);
          }

    

};

//export the convertfunction to be acessed by index.js 

module.exports= {convert}

