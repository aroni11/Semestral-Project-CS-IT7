import {Request, Response} from 'express';
import {Node} from '../schema/node';
import {Relation} from '../schema/relation';
import {Way} from '../schema/way';

export async function listHandler(req: Request, res: Response) {
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
}
