import mongoose, {Model} from 'mongoose';
import {Coordinates, GAR_ROADS, IRoads, MAX_NEAREST_DISTANCE} from '../../../config';
import {IWay} from './way';

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
  ways: IWay[];
}

export interface INodeModel extends Model<INode> {
  findNearest(coordinates: Coordinates, maxNearest?: number): Promise<INode>;
  findNearestRoad(coordinates: Coordinates, maxNearest?: number): Promise<INode>;
  findWithin(polygon: Coordinates[]): Promise<INode[]>;
  findRoadsWithin(polygon: Coordinates[]): Promise<IRoads>;
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
}, {
  toJSON: { virtuals: true },
  toObject: { getters: true}
});

// define a virtual field with all ways that contain the node
nodeSchema.virtual('ways', {
  ref: 'way',
  localField: '_id',
  foreignField: 'loc.nodes'
});

nodeSchema.statics.findNearest = function(coordinates: Coordinates, maxNearest: number = MAX_NEAREST_DISTANCE): Promise<INode> {
  return this.find({
    loc: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: maxNearest * 1000
      }
    }
  });
};

nodeSchema.statics.findNearestRoad = async function(coordinates: Coordinates, maxNearest: number = MAX_NEAREST_DISTANCE): Promise<INode> {
  const nearestNodes = await this.findNearest(coordinates, maxNearest).populate('ways', 'tags.highway').lean().exec();

  if (nearestNodes.length === 0) {
    throw new Error(`No road found in the diameter of ${maxNearest} meters!`);
  }
  return nearestNodes.find(roadNodesOnly);
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
  }, 'loc');
};

nodeSchema.statics.findRoadsWithin = async function(polygon: Coordinates[]): Promise<IRoads> {
  const nodesWithin = await this.findWithin(polygon).populate('ways', 'tags.highway tags.oneway tags.junction').lean().exec();
  if (nodesWithin.length === 0) {
    throw new Error(`No road found in the polygon!`);
  }

  const nodes = nodesWithin.filter(roadNodesOnly);
  const nodesIDs = nodes.map((wayNode: INode) => wayNode._id);
  const waysSet = new Set<IWay>();

  for (const node of nodes) {
    for (const way of node.ways) {
      if (isRoad(way) && staysInBoundary(way, nodesIDs)) {
        waysSet.add(way);
      }
    }
  }

  return {
    nodes,
    ways: [...waysSet]
  } as IRoads;
};

export const Node = mongoose.model<INode, INodeModel>('node', nodeSchema, 'nodes');

function roadNodesOnly(node: INode): boolean {
  return node.ways.some(
    (way: IWay) => isRoad(way)
  );
}

function isRoad(way: IWay): boolean {
  return way.tags
    && way.tags.hasOwnProperty('highway')
    && GAR_ROADS.includes((way.tags as any).highway);
}

function staysInBoundary(way: IWay, nodesIDs: number[]): boolean {
  return way.loc.nodes.every((nodeID: number) => nodesIDs.includes(nodeID));
}
