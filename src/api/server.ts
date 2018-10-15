import express from 'express';
import mongoose, {ConnectionOptions} from 'mongoose';
import {Node} from './schema/node';
import {Relation} from './schema/relation';
import {Way} from './schema/way';

const MONGO_URI = 'mongodb://localhost/test';
const MONGO_OPTIONS = { useNewUrlParser: true };

const app = express();

app.listen(8000, () => {
    connect(MONGO_URI, MONGO_OPTIONS);
    console.log('Server works!');
});

app.get('/api/list/:collection', (req, res) => {
  const maxResults: number = req.query.limit === undefined ? 50000 : Number(req.query.limit);
  let collection;

  switch (req.params.collection) {
    case 'nodes':
      collection = Node;
      break;
    case 'ways':
      collection = Way;
      break;
    case 'relations':
      collection = Relation;
      break;
    default:
      res.status(400).send('Invalid collection');
  }

  collection.find({}, null, { limit: maxResults }, (err, list) => {
    if (err) { res.status(503).send(err); }
    res.send(list);
  });
});

function connect(mongoURI: string, options: ConnectionOptions): void {
  mongoose.connect(mongoURI, options);
  const db = mongoose.connection;

  db.on('error', () => console.error.bind(console, 'connection error:'));
  db.once('open', () => console.log('Connected to Mongo!'));
}
