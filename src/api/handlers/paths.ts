import {Request, Response} from 'express';
import {Coordinates, GAR_ROADS} from '../../../config';
import graphBuilder from '../../algorithms/graph-builder';
import DijkstraPathfinder from '../../algorithms/pathfinders/dijkstra';
import {Node} from '../schema/node';
import {IWay, Way} from '../schema/way';

export async function pathsHandler(req: Request, res: Response) {
  if (!(req.body.coordinates)) {
    return res.status(400).send('Start and/or end point(s) missing');
  }

  try {
    const start = await Node.findNearest(req.body.coordinates[0]);
    const end = await Node.findNearest(req.body.coordinates[1]);

    if (!(start && end)) {
      return res.status(422).send('Start and/or end point(s) are too far from the nearest existing node in the database');
    }

    const aa = req.body.coordinates[0];
    const ab = [req.body.coordinates[0][0], req.body.coordinates[1][1]];
    const bb = req.body.coordinates[1];
    const ba = [req.body.coordinates[1][0], req.body.coordinates[0][1]];

    const testPolygon = [aa, ab, bb, ba, aa] as Coordinates[];
    // const nodes = await Node.findWithin(testPolygon);

    // TODO use within (polygon)
    // TODO find ways within that polygon

    const ways = await Way.find({'tags.highway': {$in: GAR_ROADS}}, 'loc tags.oneway', {limit: 10000}).lean();
    if (!ways) {
      res.status(404).end();
    } else {
      const nodeIDs = new Set(
        ways
          .map((way: IWay) => way.loc.nodes)
          .reduce((acc: number[], val: number) => acc.concat(val))
      ).values();

      const nodes = await Node.find({_id: {$in: [...nodeIDs]}}, 'loc');

      const graph = graphBuilder(nodes, ways);

      const simplified = graph.simplifyGraph(start._id, end._id, 5);

      const testPathFinder = new DijkstraPathfinder();
      const path = testPathFinder.FindPath(start._id, end._id, simplified);

      const pathCoordinates = path.map((vertexID) => [simplified.getVertex(vertexID).lng, simplified.getVertex(vertexID).lat]);

      // TODO add start and end nodes to the output
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
