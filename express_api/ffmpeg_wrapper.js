const path_mod = require('path');

// creates the command, that is handed over to FFmpeg afterwords
function createFFmpegString(body,filename){

    // take parameters from request body
    const {bitrate}         = body;
    var {outputName}        = body;
    const {outputFormat}    = body;
    const {codec}           = body;
    const {width}           = body;
    const {height}          = body;
    const {colourspace}     = body;
    const {profile}         = body;
    const {peaklum}         = body;
    const {tonemap}         = body;
    const {primaries}       = body;
    const {matrix}          = body;
    const {transfer}        = body;
    const {advanced_colour} = body;

    var colour_string = '';

    const fileToConvert = path_mod.join(__dirname, 'input', `${filename}`);
    const outputPath = path_mod.join(__dirname, 'output');
    const outputJoined=`${outputName}.${outputFormat}`;

    //build the substring used for collour space conversion
    if (advanced_colour) {
        colour_string = `-vf zscale=t=linear:npl=${peaklum},\
format=gbrpf32le,zscale=p=${primaries},tonemap=tonemap=${tonemap}:desat=0,\
zscale=t=${transfer}:m=${matrix}:r=tv,format=yuv420p`
        console.log("Colour String: "+colour_string);
    }

    //build the conversion / encoding string form requests parameters
    const ffmpeg_convert = `ffmpeg -y \
-i ${fileToConvert} ${colour_string} \
${bitrate ? `-b:v ${bitrate}M` : ``} \
${codec ? `-c:v ${codec}` : ``} \
${profile ? `-profile ${profile}` : ``} \
${(width && height) ? `-vf scale=${width}:${height}` : ``} \
${colourspace ? `-vf "colorspace=${colourspace}"` : ``} \
-movflags use_metadata_tags -map_metadata 0 \
${outputName ? `${outputPath}/${outputJoined}` : `${outputPath}/video.${outputFormat}`}`

    // creates a Objekt to return
    var stringObj = {
        command: `${ffmpeg_convert}`,
        outputPath:`${outputJoined}`,
    }

    return stringObj;
}

module.exports = {
    createFFmpegString,
}