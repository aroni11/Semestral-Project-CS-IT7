import {Request, Response} from 'express';
import {GAR_ROADS} from '../../../config';
import {Node} from '../schema/node';
import {IWay, Way} from '../schema/way';

export async function roadsHandler(req: Request, res: Response) {
  const includeAllProperties: boolean = req.query.includeAllProperties !== undefined;

  try {
    const ways = await Way.find(
      {'tags.highway': {$in: GAR_ROADS}},
      includeAllProperties ? null : 'loc tags.oneway',
      { limit: 10000 }
    ).lean();

    if (!ways) {
      res.status(404).end();
    } else {
      const nodeIDs = new Set(
        ways
          .map((way: IWay) => way.loc.nodes)
          .reduce((acc: number[], val: number) => acc.concat(val))
      ).values();

      const nodes = await Node.find({_id: {$in: [...nodeIDs]}}, includeAllProperties ? null : 'loc');

      res.send({
        nodes,
        ways
      });
    }
  } catch (e) {
    res.status(503).send(e);
  }
}
