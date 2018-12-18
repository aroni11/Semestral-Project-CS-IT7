import distance from '@turf/distance';
import {feature, Feature, featureCollection, lineString, Point, Polygon} from '@turf/helpers';
import {FeatureCollection} from '@turf/helpers/lib/geojson';
import lineToPolygon from '@turf/line-to-polygon';
import transformScale from '@turf/transform-scale';
import {Coordinates, CostFunction, MAX_NEAREST_DISTANCE, PATH_POLYGON_MARGIN, SIMPLIFICATION_ROUNDS, TOP_K_PATHS} from '../../../config';
import graphBuilder from '../../algorithms/graph-builder';
import reducers from '../../algorithms/helpers/cost-reducers';
import {printDiversities} from '../../algorithms/helpers/paths-diversity';
import {dijkstra} from '../../algorithms/pathfinders/dijkstra';
import Path from '../../algorithms/pathfinders/path';
import {skyline} from '../../algorithms/Skyline/SkylineFilter';
import {Node} from '../schema/node';

export function pathsListener(socket: any) {
  console.log('User connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('message', async (message: any) => {
    console.log('Message Received: ' + message);
    const t0 = Date.now();
    const data = JSON.parse(message);

    if ( !data.coordinates
      || !(data.coordinates as Coordinates)[0]
      || !(data.coordinates as Coordinates)[1]) {
      return socket.emit('message', {
        status: 'error',
        data: 'Start and/or end point(s) missing'
      });
    }

    const simplificationRounds = data.simplificationRounds !== undefined ? data.simplificationRounds : SIMPLIFICATION_ROUNDS;
    const topK = data.topK !== undefined ? data.topK : TOP_K_PATHS;
    const maxNearest = data.maxNearest !== undefined ? data.maxNearest : MAX_NEAREST_DISTANCE;
    const mbrMargin = data.mbrMargin !== undefined ? data.mbrMargin : PATH_POLYGON_MARGIN;
    const costFunction = getCostFunction(data.costFunction);
    const applySkyline = data.skyline !== undefined ? data.skyline : true;
    const yenKeep = data.yenKeep !== undefined ? data.yenKeep : true;

    const start = data.coordinates[0];
    const end = data.coordinates[1];

    try {
      const startNode = await Node.findNearestRoad(start, maxNearest);
      const endNode = await Node.findNearestRoad(end, maxNearest);

      if (!(startNode && endNode)) {
        return socket.emit('message', {
          status: 'error',
          data: 'Start and/or end point(s) are too far from the nearest existing node in the database'
        });
      }
      console.log('foundNearestRoads', (Date.now() - t0) / 1000);
      socket.emit('message', {
        status: 'foundNearestRoads',
        data: {
          computedStart: createPoint(startNode.loc.coordinates, 'Computed start'),
          computedEnd: createPoint(endNode.loc.coordinates, 'Computed end')
        }
      });

      const boundaryRectangle = createBoundaryRectangle(startNode.loc.coordinates, endNode.loc.coordinates, mbrMargin);
      console.log('computedBoundaryRectangle', (Date.now() - t0) / 1000);
      socket.emit('message', {
        status: 'computedBoundaryRectangle',
        data: boundaryRectangle
      });

      const roads = await Node.findRoadsWithin(boundaryRectangle.geometry.coordinates[0] as Coordinates[]);
      const nodes = roads.nodes;
      const ways = roads.ways;

      if (!(nodes && ways)) {
        return socket.emit('message', {
          status: 'error',
          data: 'No nodes and/or ways found'
        });
      }
      console.log('foundRoadsWithin', (Date.now() - t0) / 1000);
      socket.emit('message', {
        status: 'foundRoadsWithin'
      });

      const graph = graphBuilder(nodes, ways);
      console.log('builtGraph', (Date.now() - t0) / 1000);
      socket.emit('message', {
        status: 'builtGraph'
      });

      const simplified = graph.simplifyGraph(startNode._id, endNode._id, simplificationRounds);
      console.log('simplifiedGraph', (Date.now() - t0) / 1000);
      socket.emit('message', {
        status: 'simplifiedGraph'
      });
      setTimeout(() => {
        try {
          const paths = simplified.topK(startNode._id, endNode._id, dijkstra, costFunction, topK, yenKeep);
          console.log('foundTopK', (Date.now() - t0) / 1000);
          socket.emit('message', {
            status: 'foundTopK',
            data: paths.map((path) => path.evaluate().getCosts)
          });
          printDiversities(paths);
          const pathsSkyline = applySkyline ? skyline(paths) : paths;
          console.log('computedSkyline', (Date.now() - t0) / 1000);
          socket.emit('message', {
            status: 'computedSkyline',
            data: pathsSkyline.map((path) => path.evaluate().getCosts)
          });
          printDiversities(pathsSkyline);
          const response = JSON.stringify(generateResponse(start, end, startNode.loc.coordinates, endNode.loc.coordinates, pathsSkyline));
          console.log('finished', (Date.now() - t0) / 1000);
          return socket.emit('message', {
            status: 'finished',
            data: response
          });
        } catch (e) {
          console.log(e);
          return socket.emit('message', {
            status: 'error',
            data: e.message
          });
        }
      }, 5000);
    } catch (e) {
      console.error(e);
      return socket.emit('message', {
        status: 'error',
        data: e.message
      });
    }
  });
}

function createBoundaryRectangle(point1: Coordinates, point2: Coordinates, mbrMargin: number): Feature<Polygon> {
  const corner1 = point1;
  const corner2 = [point1[0], point2[1]] as Coordinates;
  const corner3 = point2;
  const corner4 = [point2[0], point1[1]] as Coordinates;
  const line = lineString([corner1, corner2, corner3, corner4]);

  const mbr = lineToPolygon(line, {autoComplete: true});
  return transformScale(mbr, computeScale(corner1, corner2, corner3, mbrMargin));
}

function computeScale(point1: Coordinates, point2: Coordinates, point3: Coordinates, mbrMargin: number): number {
  const edge1 = distance(point1, point2);
  const edge2 = distance(point2, point3);
  const shorterEdge = edge1 < edge2 ? edge1 : edge2;

  return (shorterEdge + mbrMargin) / shorterEdge;
}

function getCostFunction(name: string): CostFunction {
  switch (name) {
    case 'Sqrt of time + distance':
      return reducers.sqrtTimePlusDistance;
    case 'Sqrt of time * distance':
      return reducers.sqrtTimeByDistance;
    case 'Arithmetic mean':
      return reducers.arithmeticMean;
    case 'Geometric mean':
      return reducers.geometricMean;
    case 'Minimum':
      return reducers.minCost;
    case 'Maximum':
      return reducers.maxCost;
    default:
      return undefined;
  }
}

function generateResponse(
  start: Coordinates,
  end: Coordinates,
  computedStart: Coordinates,
  computedEnd: Coordinates,
  paths: Path[]): FeatureCollection {
  const startFeature = createPoint(start, 'Original start');
  const endFeature = createPoint(end, 'Original end');
  const computedStartFeature = createPoint(computedStart, 'Computed start');
  const computedEndFeature = createPoint(computedEnd, 'Computed end');
  const pathFeatures = paths.map((path, index) => feature({
      type: 'LineString',
      coordinates: path.pathData.map((edge) => [
        edge.vertex.lng,
        edge.vertex.lat
      ]) as Coordinates[]
    },
    {
      name: `Computed path #${index}`,
      costs: path.evaluate().getCosts
    }));

  return featureCollection([
    startFeature,
    endFeature,
    computedStartFeature,
    computedEndFeature,
    ...pathFeatures
  ]);
}

function createPoint(coordinates: Coordinates, name: string = 'Undefined point'): Feature<Point> {
  return feature({
      type: 'Point',
      coordinates
    },
    {
      name
    });
}
