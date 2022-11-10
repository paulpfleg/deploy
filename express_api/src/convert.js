

//process to call ffmpeg
//import child_process from 'child_process';

const child_process = require('child_process');
const { path } = require('express/lib/application');


//import the JS Filesystem
const fs = require('fs');
const path_mod = require('path');

function convert(filename,bitrate,outputName,outputFormat,codec,width,height,colourspace){        
    try {

      // if no path entered or no path exists at path exit without outputs

      fileToConvert = path_mod.join(__dirname, '..', 'input', `${filename}`)
      outputPath = path_mod.join(__dirname, '..', 'output')

      if (!filename || (filename && !fs.existsSync(fileToConvert))) {
        throw "File not found on convert node!";}

        const second_pass = "";

        if (second_pass) {
          second_pass = `ffmpeg -i ${fileToConvert} -b:v 0.1M -c:v h264 -vf "colorspace = bt709" bt709.mov
             `
            }


        const ffmpeg_convert = `ffmpeg -y \
            -i ${fileToConvert} \
            ${bitrate ? `-b:v ${bitrate}M` : ``} \
            ${codec ? `-c:v ${codec}` : ``} \
            ${(width && height) ? `-vf scale=${width}:${height}` : ``} \
            ${colourspace ? `-vf "colorspace=${colourspace}"` : ``} \
            -movflags use_metadata_tags -map_metadata 0 \
            ${outputName ? `${outputPath}/${outputName}.${outputFormat}` : `${outputPath}/video.${outputFormat}`} \
             `
/*         
        const ffprobe_bitrate = `
        ffprobe -v quiet -select_streams v:0 \
        -print_format json \
        -show_entries stream=bit_rate \
        -of default=noprint_wrappers=1 \
        ${outputPath}/${outputName}.${outputFormat}       
        `
        const ffprobe_metadata = `
        ffprobe -hide_banner -loglevel 32 \
        -select_streams v -print_format json -show_frames -read_intervals "%+#1" \
        -show_entries "frame=color_space,color_primaries,color_transfer,side_data_list,pix_fmt" -i ${outputPath}/${outputName}.${outputFormat}
        `
 */        
        child_process.execSync(`${ffmpeg_convert}`), { //&& ${second_pass}

            stdio: Object.values({
            //how to handle the input/output of the child pocess
            //just handle same as main
            stdin: 'inherit',
            stdout: 'inherit',
            stderr: 'inherit',
              })
            };

/*           child_process.execSync(`${ffprobe_bitrate}`, {
                stdio: Object.values({
                //how to handle the input/output of the child pocess
                //just handle same as main
                stdin: 'inherit',
                stdout: 'inherit',
                stderr: 'inherit',
                })
          });

          child_process.execSync(`${ffprobe_metadata} `, {
            stdio: Object.values({
            //how to handle the input/output of the child pocess
            //just handle same as main
            stdin: 'inherit',
            stdout: 'inherit',
            stderr: 'inherit',
            })
        }); */

      

        
            return({ ffmpeg_command : ffmpeg_convert, path : outputPath});

    } catch (exception) {
            
            console.warn(exception.message);
            throw (exception)
          }
};

//export the convertfunction to be acessed by index.js 

module.exports= {convert}

