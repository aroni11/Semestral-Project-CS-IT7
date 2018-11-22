import distance from '@turf/distance';
import {Feature, lineString, Polygon} from '@turf/helpers';
import lineToPolygon from '@turf/line-to-polygon';
import transformScale from '@turf/transform-scale';
import {Request, Response} from 'express';
import {Coordinates, PATH_POLYGON_MARGIN} from '../../../config';
import graphBuilder from '../../algorithms/graph-builder';
import DijkstraPathfinder from '../../algorithms/pathfinders/dijkstra';
import {Node} from '../schema/node';

export async function pathsHandler(req: Request, res: Response) {
  if ( !req.body.coordinates
    || !req.body.coordinates[0]
    || !req.body.coordinates[1]) {
    return res.status(400).send('Start and/or end point(s) missing');
  }
  const start = req.body.coordinates[0];
  const end = req.body.coordinates[1];

  try {
    const startNode = await Node.findNearestRoad(start);
    const endNode = await Node.findNearestRoad(end);

    if (!(startNode && endNode)) {
      return res.status(422).send('Start and/or end point(s) are too far from the nearest existing node in the database');
    }

    const boundaryRectangle = createBoundaryRectangle(start, end);
    const within = await Node.findRoadsWithin(boundaryRectangle.geometry.coordinates[0] as Coordinates[]);
    const nodes = within.nodes;
    const ways = within.ways;

    if (!(nodes && ways)) {
      return res.status(404).send('No nodes and/or ways found');
    }

    const graph = graphBuilder(nodes, ways);

    const simplified = graph.simplifyGraph(startNode._id, endNode._id, 5);

    const testPathFinder = new DijkstraPathfinder();
    const path = testPathFinder.FindPath(startNode._id, endNode._id, simplified);

    const pathCoordinates = path.map((vertexID) => [
      simplified.getVertex(vertexID).lng,
      simplified.getVertex(vertexID).lat
    ]) as Coordinates[];

    return res.json(generateResponse(start, end, startNode.loc.coordinates, endNode.loc.coordinates, pathCoordinates));
  } catch (e) {
    console.error(e);
    return res.status(503).send(e.message);
  }
}

function createBoundaryRectangle(point1: Coordinates, point2: Coordinates): Feature<Polygon> {
  const corner1 = point1;
  const corner2 = [point1[0], point2[1]] as Coordinates;
  const corner3 = point2;
  const corner4 = [point2[0], point1[1]] as Coordinates;
  const line = lineString([corner1, corner2, corner3, corner4]);

  const mbr = lineToPolygon(line, {autoComplete: true});
  return transformScale(mbr, computeScale(corner1, corner2, corner3));
}

function computeScale(point1: Coordinates, point2: Coordinates, point3: Coordinates): number {
  const edge1 = distance(point1, point2);
  const edge2 = distance(point2, point3);
  const shorterEdge = edge1 < edge2 ? edge1 : edge2;

  return (shorterEdge + PATH_POLYGON_MARGIN) / shorterEdge;
}

function generateResponse(start: Coordinates, end: Coordinates, computedStart: Coordinates, computedEnd: Coordinates, path: Coordinates[]) {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: start
        },
        properties: {
          name: 'Original start'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: end
        },
        properties: {
          name: 'Original end'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: computedStart
        },
        properties: {
          name: 'Computed start'
        }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: computedEnd
        },
        properties: {
          name: 'Computed end'
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'Computed path',
          line: 'red'
        },
        geometry: {
          type: 'LineString',
          coordinates: path
        }
      }
    ]
  };
}
