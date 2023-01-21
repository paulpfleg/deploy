# Node.js FFMPEG Converter

The application buils a API based solution, that provides a frontend, to convert files stored in S3 via FFmpeg.
Terraform code, to host the App on AWS is provided by https://github.com/paulpfleg/aws_terraform_for_ba.

The Codes implements two node.js server. aws_node offers a UI and the API functionalitys to interact with S3.
express_api implements API endpoints to wrap the recieved Parameters in FFMPPEG commands.

## Quickstart 

To start using the code, you should follow these steps:
* make node.js and FFmpeg are installed in their latest versions
* install all dependencies in the aws_node or express_api folder
* start start both servers by typing the following in a terminal located in each of the folders
* * AWSAccessKeyId=YOUR_S3_KEY AWSSecretKey=YOUR_S3_SECRET_KEY node .

* Best practice to automaticly run all of these steps is using the terraform IaaC in the repo above.