import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const String = Schema.Types.String;
const Number = Schema.Types.Number;
const Date = Schema.Types.Date;
const Boolean = Schema.Types.Boolean;
const Array = Schema.Types.Array;

const waySchema = new mongoose.Schema({
  _id: Number,
  osm_id: { type: Number, index: 'osm_id'},
  type: {type: String, default: 'way'},
  loc: {
    type: { type: String },
    nodes: { type: Array, default: []},
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

export const Way = mongoose.model('way', waySchema, 'ways');
