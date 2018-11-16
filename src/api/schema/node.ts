import mongoose, {Model} from 'mongoose';
import {MAX_NEAREST_DISTANCE} from '../../../config';

const Schema = mongoose.Schema;
const String = Schema.Types.String;
const Number = Schema.Types.Number;
const Date = Schema.Types.Date;
const Boolean = Schema.Types.Boolean;

export interface INode extends mongoose.Document {
  _id: number;
  loc: {
    type: string,
    coordinates: [number, number]
  };
}

export interface INodeModel extends Model<INode> {
  findNearest(coordinates: [number, number]): Promise<INode>;
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

nodeSchema.statics.findNearest = function(coordinates: [number, number]): Promise<INode> {
  return this.findOne({
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

export const Node = mongoose.model<INode, INodeModel>('node', nodeSchema, 'nodes');
