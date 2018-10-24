import bodyParser from 'body-parser';
import express from 'express';
import mongoose, {ConnectionOptions} from 'mongoose';
import {MONGO_OPTIONS, MONGO_URI, SERVER_PORT} from '../../config';
import {findByIdHandler} from './handlers/findById';
import {listHandler} from './handlers/list';
import {nodesWithinHandler} from './handlers/nodesWithin';
import {roadsHandler} from './handlers/roads';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(SERVER_PORT, () => {
  connect(MONGO_URI, MONGO_OPTIONS);
  console.log(`Server is up and listening on port ${SERVER_PORT}.`);
});

app.get('/api/list/:collection', listHandler);

app.get('/api/:collection/:id', findByIdHandler);

app.get('/api/roads', roadsHandler);

app.post('/api/within', nodesWithinHandler);

function connect(mongoURI: string, options: ConnectionOptions): void {
  mongoose.set('useCreateIndex', true);
  mongoose.connect(mongoURI, options);
  const db = mongoose.connection;

  db.on('error', () => console.error.bind(console, 'connection error:'));
  db.once('open', () => console.log('Connected to Mongo!'));
}
