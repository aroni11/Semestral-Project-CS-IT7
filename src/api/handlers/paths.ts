import {Request, Response} from 'express';
import {GAR_ROADS} from '../../../config';
import graphBuilder from '../../algorithms/graph-builder';
import DijkstraPathfinder from '../../algorithms/pathfinders/dijkstra';
import {Node} from '../schema/node';
import {IWay, Way} from '../schema/way';

export async function pathsHandler(req: Request, res: Response) {
  const includeAllProperties: boolean = req.query.includeAllProperties !== undefined; // TODO shouldn't be necessary (leftover from roads)
  const start = 1805848713; // TODO start as a parameter, currently Fibigerstræde 14
  const end = 3357021686; // TODO end as a parameter, currently Cassiopeia

  try {
    const ways = await Way.find({'tags.highway': {$in: GAR_ROADS}}, includeAllProperties ? null : 'loc', { limit: 10000 }).lean();
    if (!ways) {
      res.status(404).end();
    } else {
      const nodeIDs = new Set(
        ways
          .map((way: IWay) => way.loc.nodes)
          .reduce((acc: number[], val: number) => acc.concat(val))
      ).values();

      const nodes = await Node.find({_id: {$in: [...nodeIDs]}}, includeAllProperties ? null : 'loc');

      const graph = graphBuilder(nodes, ways);

      const simplified = graph.simplifyGraph(start, end, 3);

      const testPathFinder = new DijkstraPathfinder();
      const path = testPathFinder.FindPath(start, end, simplified);

      const pathCoordinates = path.map((vertexID) => [simplified.getVertex(vertexID).lng, simplified.getVertex(vertexID).lat]);

      res.json({
        type: 'Feature',
        properties: {
          name: 'Computed path',
          line: 'red'
        },
        geometry: {
          type: 'LineString',
          coordinates: pathCoordinates
        }
      });
    }
  } catch (e) {
    res.status(503).send(e);
  }
}