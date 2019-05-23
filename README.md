# CreateThumbnailAPI
 

## Description

This project is for the system which user can get a thumbnail of the image user post.
Below is the description for each of directories.

- mongoContainer - includes scripts for initialization of MongoDB container
- nodeJSContainer - includes an application of API and setting for initialization of container
- rabbitMQContainer - includes scripts for initialization of RabbitMQ container
- workerContainer - includes an application of worker and setting for initialization fo workerContainer
- testmodule - includes testmodule of the project

## Requirement

- Docker
- Docker-compose(Ver3.0)

## Usage

1. Send a post request to http://localhost:3000/image with an image file.you can send it using like curl command.
   Example is below

      $   curl -F "image=@./test.jpg" localhost:3000/image
 
2. Access URL of thumbnail shown in the responce of the post request
3. Got a thumbnail file.

## Installation

    $ docker-compose up -d
It will take a while to set up application in the containers.
So please wait for around 30 seconds after runnin it.

## Testing

After running docker-compose successfully, move into testmodule and run command below.

	$ npm test
 
