import distance from '@turf/distance';
import {feature, Feature, featureCollection, lineString, Polygon} from '@turf/helpers';
import lineToPolygon from '@turf/line-to-polygon';
import transformScale from '@turf/transform-scale';
import {Request, Response} from 'express';
import {Coordinates, PATH_POLYGON_MARGIN, SIMPLIFICATION_ROUNDS, TOP_K_PATHS} from '../../../config';
import graphBuilder from '../../algorithms/graph-builder';
import {dijkstra} from '../../algorithms/pathfinders/dijkstra';
import {skyline} from '../../algorithms/Skyline/SkylineFilter';
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

    const boundaryRectangle = createBoundaryRectangle(startNode.loc.coordinates, endNode.loc.coordinates);
    const roads = await Node.findRoadsWithin(boundaryRectangle.geometry.coordinates[0] as Coordinates[]);
    const nodes = roads.nodes;
    const ways = roads.ways;

    if (!(nodes && ways)) {
      return res.status(404).send('No nodes and/or ways found');
    }

    const graph = graphBuilder(nodes, ways);

    const simplified = graph.simplifyGraph(startNode._id, endNode._id, SIMPLIFICATION_ROUNDS);

    const paths = simplified.topK(startNode._id, endNode._id, dijkstra, undefined, TOP_K_PATHS);

    const pathsSkyline = skyline(paths);

    const pathsCoordinates = pathsSkyline.map((path) => path.pathData.map((edge) => [
      edge.vertex.lng,
      edge.vertex.lat
    ]) as Coordinates[]);

    const pathsNodeIDs = paths.map((path) => path.pathData.map((edge) =>
      edge.vertex.id
    ) as number[]);

    const pathsAsSequence = pathsNodeIDs.map(value => value.join('->'));

    console.log(pathsAsSequence.join('\n'));

    const paths2DPoints = paths.map(value =>
      value.evaluate().getCost('distance') + ',' + value.evaluate().getCost('time')
    );

    console.log(paths2DPoints.join('\n'));

    return res.json(generateResponse(start, end, pathsCoordinates));
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

function generateResponse(
  start: Coordinates,
  end: Coordinates,
  paths: Coordinates[][]) {
  const startFeature = feature({
      type: 'Point',
      coordinates: start
    },
    {
      name: 'Original start'
    });
  const endFeature = feature({
      type: 'Point',
      coordinates: end
    },
    {
      name: 'Original end'
    });
  const pathFeatures = paths.map((path, index) => feature({
      type: 'LineString',
      coordinates: path
    },
    {
      name: `Computed path #${index}`
    }));

  return featureCollection([
    startFeature,
    endFeature,
    ...pathFeatures
  ]);
}
