/**
 * URL to running MongoDB instance
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
 * Define the structure of coordinates we use throughout the application
 */
export type Coordinates = [number, number];
