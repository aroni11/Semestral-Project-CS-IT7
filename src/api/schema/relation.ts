import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const String = Schema.Types.String;
const Number = Schema.Types.Number;
const Date = Schema.Types.Date;
const Boolean = Schema.Types.Boolean;

const relationSchema = new mongoose.Schema({
  _id: Number,
  osm_id: { type: Number },
  type: {type: String, default: 'relation'},
  loc: {},
  members: [],
  version: Number,
  uid: Number,
  user: String,
  changeset: Number,
  timestamp: Date,
  visible: Boolean,
  osmTimeBucket: Object,
  updateTimeBucket: Object,
  tags: {}
});

export const Relation = mongoose.model('relation', relationSchema, 'relations');
