import express from 'express';
import mongoose, {ConnectionOptions} from 'mongoose';
import {GAR_ROADS, MONGO_OPTIONS, MONGO_URI, SERVER_PORT} from '../../config';
import {Node} from './schema/node';
import {Relation} from './schema/relation';
import {Way} from './schema/way';

const app = express();

app.listen(SERVER_PORT, () => {
  connect(MONGO_URI, MONGO_OPTIONS);
  console.log(`Server is up and listening on port ${SERVER_PORT}.`);
});

app.get('/api/list/:collection', async (req, res) => {
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
      return;
  }

  const maxResults: number = req.query.limit === undefined ? 50000 : Number(req.query.limit);

  try {
    res.send(await collection.find({}, null, { limit: maxResults }));
  } catch (e) {
    res.status(503).send(e);
  }
});

app.get('/api/:collection/:id', async (req, res) => {
  let collection;

  switch (req.params.collection) {
    case 'node':
      collection = Node;
      break;
    case 'way':
      collection = Way;
      break;
    case 'relation':
      collection = Relation;
      break;
    default:
      res.status(400).send('Invalid collection');
      return;
  }

  const includeAllProperties: boolean = req.query.includeAllProperties !== undefined;

  try {
    const resp = await collection.findById(req.params.id, includeAllProperties ? null : 'loc');
    if (!resp) {
      res.status(404).end();
    } else {
      res.send(resp);
    }
  } catch (e) {
    res.status(503).send(e);
  }
});

function connect(mongoURI: string, options: ConnectionOptions): void {
  mongoose.set('useCreateIndex', true);
  mongoose.connect(mongoURI, options);
  const db = mongoose.connection;

  db.on('error', () => console.error.bind(console, 'connection error:'));
  db.once('open', () => console.log('Connected to Mongo!'));
}
