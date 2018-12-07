import bodyParser from 'body-parser';
import express from 'express';
import mongoose, {ConnectionOptions} from 'mongoose';
import socketIo from 'socket.io';
import {MONGO_OPTIONS, MONGO_URI, SERVER_PORT, SOCKET_IO_PING_INTERVAL, SOCKET_IO_PING_TIMEOUT} from '../../config';
import {findByIdHandler} from './handlers/findById';
import {listHandler} from './handlers/list';
import {nodesWithinHandler} from './handlers/nodesWithin';
import {pathsHandler} from './handlers/paths';
import {roadsHandler} from './handlers/roads';
import {pathsListener} from './listeners/paths';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/api/list/:collection', listHandler);

app.get('/api/:collection/:id', findByIdHandler);

app.get('/api/roads', roadsHandler);

app.post('/api/within', nodesWithinHandler);

app.post('/api/paths', pathsHandler);

const server = app.listen(SERVER_PORT, () => {
  connect(MONGO_URI, MONGO_OPTIONS);
  console.log(`Server is up and listening on port ${SERVER_PORT}.`);
});

const io = socketIo.listen(server, {
  pingInterval: SOCKET_IO_PING_INTERVAL,
  pingTimeout: SOCKET_IO_PING_TIMEOUT
});

io.of('/socket/paths').on('connection', pathsListener);

function connect(mongoURI: string, options: ConnectionOptions): void {
  mongoose.set('useCreateIndex', true);
  mongoose.connect(mongoURI, options);
  const db = mongoose.connection;

  db.on('error', () => console.error.bind(console, 'connection error:'));
  db.once('open', () => console.log('Connected to Mongo!'));
}
