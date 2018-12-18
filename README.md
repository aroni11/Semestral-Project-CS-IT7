# Generating (good) Alternative Routes
This is a semester project in Computer Science at Aalborg University.

## Getting started
This guide will show you how to successfully install and run this project. This is the first part of the
project - the server part that implements a server providing REST API with endpoints that can be used
to test the proposed algorithm.

### Prerequisites
- [Node.js 8](https://nodejs.org/en/)
- [npm](https://npm.com/)
- [MongoDB 2.2.19 or higher](https://docs.mongodb.com/manual/installation/)

You can check your version by running `node --version` or `mongod --version` respectively. 
Also make sure that your local db folder (`/data/db` by default) exists and MongoDB has 
read&write permissions.

### Installing dependencies
Install all packages using [npm](https://www.npmjs.com/): `npm install`.

### Importing data
Run `mongod & mongosm -v -f "<OSMFileName>.osm"` to import data from .osm file to your local MongoDB. 
You will probably have to specify a full path to the mongosm script, as it is installed localy by 
default (or you can run the command using npm). By default a new database called _test_ will be
 created, with collections _nodes_, _relations_ and _ways_. All data in the database are in 
 the [GeoJSON](http://geojson.org/) format.

## Running the server
To successfully build and start the express server, simply use `npm run build` and `npm run start`. To avoid recompiling the project on every change, simply run the compiler in watch mode: `npm run watch-ts`. 

If everything goes well you should see that the server outputs the following:

`Server is up and listening on port 8000.`

`Connected to Mongo!`


The server will be available at `localhost:8000`. You can try entering `http://localhost:8000/api/list/nodes` 
to your browser to verify that the server has successfully started and is available to accept connections. 

The endpoint should return the whole collection of nodes that was imported in your locally hosted MongoDB.

## Running the UI
Attached to the paper you can find `client.zip` where you can find the frontend app that will connect to
this server and provide you with UI.
