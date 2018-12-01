import {CostFunction, PathFinder} from '../../../config';
import Edge from '../models/edge';
import Graph from '../models/graph';
import Vertex from '../models/vertex';
import Path from './path';

export default function(graph: Graph,
                        start: number,
                        end: number,
                        pathFinder: PathFinder,
                        costsFunction: CostFunction,
                        topK: number): Path[] {
  const paths: Path[] = [pathFinder(start, end, graph, costsFunction)];
  const alternativePaths: Path[] = [];
  let deletedEdges: Array<[number, Edge]> = [];
  let deletedVertices: Vertex[] = [];

  for (let k = 1; k <= topK; k++) {
    // The spur node ranges from the first node to the next to last node in the previous k-shortest path.
    for (let i = 0; i < paths[k - 1].pathData.length - 1; i++) {
      // Spur node is retrieved from the previous k-shortest path, k − 1.
      const spur = paths[k - 1].pathData[i];
      // rootPath = The sequence of nodes from the source to the spur node of the previous k-shortest path.
      const rootPath = paths[k - 1].slice(0, i + 1);
      // for each path p in A:
      for (const path of paths) {
        // if rootPath == p.nodes(0, i):
        if (Path.equal(rootPath, path.slice(0, i + 1))) {
          // Remove the links that are part of the previous shortest paths which share the same root path.
          // remove p.edge(i,i + 1) from Graph;
          const removedEdge = graph.removeEdge(path.pathData[i].vertex.id, path.pathData[i + 1].vertex.id);
          if (removedEdge !== undefined) {
            // remember removed edges so the graph can be restored later
            deletedEdges.push([path.pathData[i].vertex.id, removedEdge]);
          }
        }
      }
      const rootPathNodes = rootPath.pathData.map((edge: Edge) => edge.vertex);
      // for each node rootPathNode in rootPath except spurNode:
      for (const rootPathNode of rootPathNodes) {
        //   remove rootPathNode from Graph;
        if (rootPathNode.id === spur.vertex.id) {
          continue;
        }
        graph.removeVertex(rootPathNode.id, deletedEdges);
        // remember removed vertices so the graph can be restored later
        deletedVertices.push(rootPathNode);
      }

      // Calculate the spur path from the spur node to the sink.
      try {
        const spurPath = pathFinder(spur.vertex.id, end, graph, costsFunction);

        // Entire path is made up of the root path and spur path.
        // totalPath = rootPath + spurPath;
        const totalPath = Path.join(rootPath, spurPath);

        // check if the new path is unique
        if (alternativePaths.every((path) => !Path.equal(path, totalPath))) {
          // Add the potential k-shortest path to the heap.
          // B.append(totalPath);
          alternativePaths.push(totalPath);
        }
      } catch (e) {
        // console.log('No unique spur path can be found');
      }

      // Add back the edges and nodes that were removed from the graph.
      // restore nodes in rootPath to Graph;
      for (const vertex of deletedVertices) {
        graph.addVertex(vertex);
      }
      // restore edges to Graph;
      for (const [vertexID, edge] of deletedEdges) {
        graph.getVertex(vertexID).addNeighbor(new Edge(edge.vertex, edge.costs));
      }
      deletedEdges = [];
      deletedVertices = [];
    }

    if (alternativePaths.length === 0) {
      break;
    }

    // sort alternative paths by costs
    alternativePaths.sort((a: Path, b: Path) => Path.compare(a, b));

    // remove duplicities
    while (alternativePaths.length > 0 && paths.some((path) => Path.equal(path, alternativePaths[0]))) {
      alternativePaths.shift();
    }
    paths.push(alternativePaths[0]);
  }
  return paths.concat(alternativePaths);
}
