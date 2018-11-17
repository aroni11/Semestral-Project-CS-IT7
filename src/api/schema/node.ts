import mongoose, {Model} from 'mongoose';
import {Coordinates, GAR_ROADS, MAX_NEAREST_DISTANCE} from '../../../config';
import {Way} from './way';

const Schema = mongoose.Schema;
const String = Schema.Types.String;
const Number = Schema.Types.Number;
const Date = Schema.Types.Date;
const Boolean = Schema.Types.Boolean;

export interface INode extends mongoose.Document {
  _id: number;
  loc: {
    type: string,
    coordinates: Coordinates
  };
}

export interface INodeModel extends Model<INode> {
  findNearest(coordinates: Coordinates): Promise<INode>;
  findNearestRoad(coordinates: Coordinates): Promise<INode>;
  findWithin(polygon: Coordinates[]): Promise<INode[]>;
}

const nodeSchema = new mongoose.Schema({
  _id: Number,
  osm_id: { type: Number },
  type: {type: String, default: 'node'},
  loc: {
    type: Object,
    coordinates: [Number],
    index: '2dsphere'
  },
  osmTimeBucket: Object,
  updateTimeBucket: Object,
  version: Number,
  uid: Number,
  user: String,
  changeset: Number,
  timestamp: Date,
  visible: Boolean,
  tags: {}
});

nodeSchema.statics.findNearest = function(coordinates: Coordinates): Promise<INode> {
  return this.find({
    loc: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: MAX_NEAREST_DISTANCE
      }
    }
  });
};

nodeSchema.statics.findNearestRoad = async function(coordinates: Coordinates): Promise<INode> {
  const nearestNodes = await this.findNearest(coordinates);

  // now find the nearest node that is a part of a road
  for (const node of nearestNodes) {
    const ways = await Way.find({ $and: [
        { 'loc.nodes': node._id },
        { 'tags.highway': {$in: GAR_ROADS} }
      ]});

    if (ways.length) {
      return node;
    }
  }

  throw new Error(`No road found in the diameter of ${MAX_NEAREST_DISTANCE} meters!`);
};

nodeSchema.statics.findWithin = function(polygon: Coordinates[]): Promise<INode[]> {
  return this.find({
    loc: {
      $geoWithin: {
        $geometry: {
          type: 'Polygon',
          coordinates: [polygon]
        }
      }
    }
  });
};

export const Node = mongoose.model<INode, INodeModel>('node', nodeSchema, 'nodes');
