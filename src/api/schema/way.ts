import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const String = Schema.Types.String;
const Number = Schema.Types.Number;
const Date = Schema.Types.Date;
const Boolean = Schema.Types.Boolean;
const Array = Schema.Types.Array;

export interface IWay extends mongoose.Document {
  _id: number;
  loc: {
    type: string,
    nodes: []
  };
  tags: object;
}

const waySchema = new mongoose.Schema({
  _id: Number,
  osm_id: { type: Number, index: 'osm_id'},
  type: { type: String, default: 'way' },
  loc: {
    type: { type: String },
    nodes: [Number],
    coordinates: []
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

export const Way = mongoose.model<IWay>('way', waySchema, 'ways');
