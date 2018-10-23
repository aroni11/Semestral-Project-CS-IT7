import {Request, Response} from 'express';
import {Node} from '../schema/node';
import {Relation} from '../schema/relation';
import {Way} from '../schema/way';

export async function findByIdHandler(req: Request, res: Response) {
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
}
