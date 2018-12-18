import EdgeCost from './src/algorithms/models/edgecost';
import Graph from './src/algorithms/models/graph';
import Path from './src/algorithms/pathfinders/path';
import {INode} from './src/api/schema/node';
import {IWay} from './src/api/schema/way';

/**
 * URI to running MongoDB instance
 */
export const MONGO_URI = 'mongodb://localhost/aalborg';

/*
 * Options to be passed when connecting to MongoDB
 */
export const MONGO_OPTIONS = { useNewUrlParser: true };

/*
 * ExpressJS server port
 */
export const SERVER_PORT = 8000;

/*
 * Socket.io ping interval (how many ms before sending a new ping packet)
 */
export const SOCKET_IO_PING_INTERVAL = 2500000;

/*
 * Socket.io ping timeout (how many ms without a pong packet to consider the connection closed)
 */
export const SOCKET_IO_PING_TIMEOUT = 10000000;

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
  'living_street',
  'cycleway',
  'footway'
];

/*
 * Default number of simplifications of a graph
 */
export const SIMPLIFICATION_ROUNDS = 5;

/*
 * Default number of generated alternative paths
 */
export const TOP_K_PATHS = 5;

/*
 * Maximum distance for finding the nearest node in kilometers
 */
export const MAX_NEAREST_DISTANCE = 1;

/*
 * Amount of kilometers added to start&end nodes boundary rectangle
 */
export const PATH_POLYGON_MARGIN = 2;

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

/*
 * Define how a function for finding a path should look like
 */
export type PathFinder = (s: number, e: number, g: Graph, cf: CostFunction) => Path;

/*
 * Define how a cost function should look like
 */
export type CostFunction = (cost: EdgeCost) => number;

export var graphMaxCosts: EdgeCost = EdgeCost.zero;
