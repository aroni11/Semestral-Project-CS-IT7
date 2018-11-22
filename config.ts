import {INode} from './src/api/schema/node';
import {IWay} from './src/api/schema/way';

/**
 * URI to running MongoDB instance
 */
export const MONGO_URI = 'mongodb://localhost/test';

/*
 * Options to be passed when connecting to MongoDB
 */
export const MONGO_OPTIONS = { useNewUrlParser: true };

/*
 * ExpressJS server port
 */
export const SERVER_PORT = 8000;

/*
 * A list of supported road types
 */
export const GAR_ROADS = [
  'motorway',
  'trunk',
  'primary',
  'secondary',
  'tertiary',
  'unclassified',
  'residential',
  'service',
  'motorway_link',
  'trunk_link',
  'primary_link',
  'secondary_link',
  'tertiary_link',
  'living_street'
];

/*
 * Maximum distance for finding the nearest node in meters
 */
export const MAX_NEAREST_DISTANCE = 500;

/*
 * Amount of kilometers added to start&end nodes boundary rectangle
 */
export const PATH_POLYGON_MARGIN = 5;

/*
 * Define the structure of coordinates we use throughout the application
 */
export type Coordinates = [number, number];

/*
 * Roads are collection of ways and their nodes
 */
export interface IRoads {
  nodes: INode[];
  ways: IWay[];
}
