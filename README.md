# Generating (good) Alternative Routes
This is a semester project in Computer Science at Aalborg University.

Generating Good Alternative Routes

## Getting started
This guide will show you how to successfully install and run this project.

### Prerequisites
- [Node.js 8](https://nodejs.org/en/)
- [MongoDB 2.2.19 or higher](https://docs.mongodb.com/manual/installation/)

You can check your version by running `node --version` or `mongod --version` respectively. Also make sure that your local db folder (`/data/db` by default) exists and MongoDB has read&write permissions.

### Installing dependencies
Install all packages using [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/lang/en/): `npm install` or simply `yarn` (note: when using yarn, additional option `--ignore-engines` might have to be added to prevent node version errors).

### Importing data
Run `mongod & mongosm -v -f "<OSMFileName>.osm"` to import data from .osm file to your local MongoDB. You will probably have to specify a full path to the mongosm script, as it is installed localy by default (or you can run the command using npm/yarn). By default a new database called _test_ will be created, with collections _nodes_, _relations_ and _ways_. All data in the database are in the [GeoJSON](http://geojson.org/) format, so [geospatial queries](https://docs.mongodb.com/manual/geospatial-queries/) will be possible in the future.

You can find more information about these elements in the [OSM wiki](https://wiki.openstreetmap.org/wiki/Elements).

#### Node
A node represents a specific point on the earth's surface defined by its latitude and longitude. Each node comprises at least an id number and a pair of coordinates.

#### Way
A way is an ordered list of between 2 and 2,000 nodes that define a polyline. Ways are used to represent linear features such as rivers and roads.

#### Relation
A relation is a multi-purpose data structure that documents a relationship between two or more data elements (nodes, ways, and/or other relations). Examples include:

- A route relation, which lists the ways that form a major (numbered) highway, a cycle route, or a bus route.
- A turn restriction that says you can't turn from one way into another way.
- A multipolygon that describes an area (whose boundary is the 'outer way') with holes (the 'inner ways').

**Once you have the OSM data in DB that's it, really. You can also try running the express server, which we could later use as a REST API server.**

## Running the server
To successfully build and start the express server, simply use `yarn run build` and `yarn run start`.

**But there are no working endpoints atm... Maybe it will be able to return a good alternative routes one day ;)**

## Are you able to work with repo?
- Yeah, I am! (Honza)
- Seems so (Jedi(fla)master)
